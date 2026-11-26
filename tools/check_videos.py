# /// script
# requires-python = ">=3.10"
# dependencies = ["rich>=13"]
# ///
"""Confere se os vídeos de todas as rádios ainda tocam no player embutido.

Uso: uv run tools/check_videos.py                 (na raiz do projeto)
     uv run tools/check_videos.py --paginas       (força o modo sem chave)
     uv run tools/check_videos.py --paginas -j 2  (2 páginas ao mesmo tempo; padrão 4)

Para cada vídeo de stations.js, avisa se:
  - foi removido, ficou privado ou indisponível;
  - tem restrição de idade: não toca embutido;
  - o dono bloqueou a incorporação em outros sites;
  - está bloqueado no Brasil;
  - a duração mudou (a posição "ao vivo" usa o dur de stations.js).

Dois modos:
  - YouTube Data API v3 (padrão quando há chave): 50 vídeos por requisição, então todas as
    rádios saem em poucas chamadas, sem risco de bloqueio. A chave vem de YOUTUBE_API_KEY
    (variável de ambiente ou linha YOUTUBE_API_KEY=... no .env da raiz, que não vai pro git).
  - Páginas (sem chave): abre a página de cada vídeo e lê o playabilityStatus. Se o YouTube
    limitar (429/captcha), espera e tenta de novo; se continuar, o resto fica "não verificado".
No fim grava relatorio-videos.md na raiz. Código de saída: 0 tudo OK, 1 alguma rádio com
problema, 2 sem problemas mas com rádios não verificadas.
"""
import argparse, json, os, re, sys, pathlib, threading, time, urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

from rich.console import Console, Group
from rich.live import Live
from rich.progress import BarColumn, MofNCompleteColumn, Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich.spinner import Spinner
from rich.table import Table
from rich.text import Text

ROOT = pathlib.Path(__file__).resolve().parent.parent
RELATORIO = ROOT / 'relatorio-videos.md'
TOLERANCIA_DUR = 5  # segundos
ESPERAS_429 = [5, 15, 30]  # segundos entre as tentativas quando o YouTube limita
LOTE_API = 50  # máximo de ids por chamada do videos.list
OK, PROBLEMA, NAO_VERIFICADO = 'ok', 'problema', 'não verificado'
console = Console()


class Bloqueado(Exception):
    pass


def secs(t):
    n = 0
    for p in t.split(':'):
        n = n * 60 + int(p)
    return n


def fmt(s):
    h, r = divmod(s, 3600)
    return f'{h}:{r // 60:02}:{r % 60:02}' if h else f'{r // 60}:{r % 60:02}'


def estacoes():
    jogo, out = None, []
    for line in (ROOT / 'stations.js').read_text().splitlines():
        m = re.match(r"\s*(\w+): \[\s*$", line)
        if m:
            jogo = m.group(1)
        m = re.search(r"name: '((?:[^'\\]|\\.)*)'.*?id: '([\w-]{11})', dur: d\('([\d:]+)'\)", line)
        if m:
            out.append(dict(jogo=jogo, nome=m.group(1).replace("\\'", "'"), vid=m.group(2), dur=secs(m.group(3))))
    return out


def baixar(vid):
    req = urllib.request.Request(f'https://www.youtube.com/watch?v={vid}&hl=en',
        headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en', 'Cookie': 'CONSENT=YES+1'})
    try:
        r = urllib.request.urlopen(req, timeout=30)
    except urllib.error.HTTPError as ex:
        if ex.code == 429:
            raise Bloqueado('YouTube limitou as requisições (429)')
        raise
    if 'google.com/sorry' in r.geturl():
        raise Bloqueado('YouTube pediu captcha')
    return r.read().decode('utf-8', 'replace')


def checar(e):
    """Devolve a lista de problemas do vídeo (vazia = tudo certo)."""
    html = baixar(e['vid'])
    m = re.search(r'var ytInitialPlayerResponse = (\{.*?\});(?:var |</script>)', html)
    if not m:
        return ['página sem dados do player (YouTube mudou o formato?)']
    p = json.loads(m.group(1))
    ps = p.get('playabilityStatus', {})
    status, motivo = ps.get('status'), ps.get('reason') or ''
    probs = []
    if status == 'LOGIN_REQUIRED':
        probs.append(f'pede login: {motivo}' if motivo else 'pede login')
    elif status != 'OK':
        probs.append(f'{status}: {motivo}'.rstrip(': '))
    elif not ps.get('playableInEmbed'):
        probs.append('incorporação desativada pelo dono')
    paises = p.get('microformat', {}).get('playerMicroformatRenderer', {}).get('availableCountries')
    if paises and 'BR' not in paises:
        probs.append('bloqueado no Brasil')
    real = p.get('videoDetails', {}).get('lengthSeconds')
    if real and abs(int(real) - e['dur']) > TOLERANCIA_DUR:
        probs.append(f"duração mudou: stations.js {fmt(e['dur'])}, vídeo {fmt(int(real))} → dur: d('{fmt(int(real))}')")
    return probs


def chave_api():
    if os.environ.get('YOUTUBE_API_KEY'):
        return os.environ['YOUTUBE_API_KEY'].strip()
    env = ROOT / '.env'
    if env.exists():
        for line in env.read_text().splitlines():
            k, _, v = line.partition('=')
            if k.strip() == 'YOUTUBE_API_KEY' and v.strip():
                return v.strip().strip('"\'')
    return None


def iso_secs(d):
    """PT1H34M26S -> 5666"""
    m = re.fullmatch(r'P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', d or '')
    if not m:
        return None
    dd, h, mi, se = (int(x or 0) for x in m.groups())
    return ((dd * 24 + h) * 60 + mi) * 60 + se


def checar_lote_api(lote, chave):
    """Consulta até 50 vídeos numa chamada. Devolve [(estação, estado, mensagens)]."""
    qs = urllib.parse.urlencode({'part': 'status,contentDetails', 'id': ','.join(e['vid'] for e in lote),
                                 'maxResults': LOTE_API, 'key': chave})
    try:
        r = urllib.request.urlopen(f'https://www.googleapis.com/youtube/v3/videos?{qs}', timeout=30)
        itens = {it['id']: it for it in json.load(r).get('items', [])}
    except urllib.error.HTTPError as ex:
        try:
            erro = json.load(ex)['error']
            motivo = (erro.get('errors') or [{}])[0].get('reason', '')
            msg = f"API do YouTube: {erro.get('message', ex)}" + (f' ({motivo})' if motivo else '')
        except Exception:
            msg = f'API do YouTube: {ex}'
        return [(e, NAO_VERIFICADO, [msg]) for e in lote]
    except Exception as ex:
        return [(e, NAO_VERIFICADO, [f'erro ao consultar a API: {ex}']) for e in lote]

    out = []
    for e in lote:
        it = itens.get(e['vid'])
        if not it:
            out.append((e, PROBLEMA, ['removido ou indisponível']))
            continue
        st, cd, probs = it.get('status', {}), it.get('contentDetails', {}), []
        if st.get('privacyStatus') == 'private':
            probs.append('vídeo privado')
        if st.get('uploadStatus') not in (None, 'processed'):
            motivo = st.get('rejectionReason') or st.get('failureReason') or ''
            probs.append(f"upload {st['uploadStatus']}" + (f': {motivo}' if motivo else ''))
        if cd.get('contentRating', {}).get('ytRating') == 'ytAgeRestricted':
            probs.append('restrição de idade (não toca embutido)')
        if st.get('embeddable') is False:
            probs.append('incorporação desativada pelo dono')
        reg = cd.get('regionRestriction', {})
        if 'BR' in reg.get('blocked', []) or ('allowed' in reg and 'BR' not in reg['allowed']):
            probs.append('bloqueado no Brasil')
        real = iso_secs(cd.get('duration'))
        if real and abs(real - e['dur']) > TOLERANCIA_DUR:
            probs.append(f"duração mudou: stations.js {fmt(e['dur'])}, vídeo {fmt(real)} → dur: d('{fmt(real)}')")
        out.append((e, PROBLEMA if probs else OK, probs))
    return out


class Painel:
    """Parte que fica se atualizando: barra de progresso + o que está sendo testado agora."""

    def __init__(self, total, titulo):
        self.lock = threading.Lock()
        self.testando = {}  # vid -> (estação, início, aviso)
        self.parar = threading.Event()  # YouTube bloqueou de vez: não insiste nos que faltam
        self.fila = total
        self.progresso = Progress(SpinnerColumn(), TextColumn(f'[bold]{titulo}'), BarColumn(),
                                  MofNCompleteColumn(), TextColumn('[green]{task.fields[ok]} ok'),
                                  TextColumn('[red]{task.fields[ruins]} com problema'),
                                  TextColumn('[yellow]{task.fields[nv]} não verificadas'), TimeElapsedColumn())
        self.tarefa = self.progresso.add_task('', total=total, ok=0, ruins=0, nv=0)

    def comecou(self, e):
        with self.lock:
            self.fila -= 1
            self.testando[e['vid']] = (e, time.monotonic(), '')

    def avisar(self, e, aviso):
        with self.lock:
            ent, ini, _ = self.testando[e['vid']]
            self.testando[e['vid']] = (ent, ini, aviso)

    def terminou(self, e, estado):
        with self.lock:
            self.testando.pop(e['vid'], None)
        f = self.progresso.tasks[0].fields
        self.progresso.update(self.tarefa, advance=1, ok=f['ok'] + (estado == OK),
                              ruins=f['ruins'] + (estado == PROBLEMA), nv=f['nv'] + (estado == NAO_VERIFICADO))

    def __rich__(self):
        tab = Table(box=None, show_header=False, padding=(0, 1))
        with self.lock:
            agora = list(self.testando.values())
            fila = self.fila
        for e, ini, aviso in agora:
            tab.add_row(Spinner('dots', style='yellow'), f"[dim]{e['jogo']}", e['nome'],
                        f"[dim]{time.monotonic() - ini:.1f}s", f'[yellow]{aviso}')
        rodape = Text(f'  {fila} na fila', style='dim') if fila else Text('')
        return Group(self.progresso, tab, rodape)


MARCA = {OK: '[green]✓[/]', PROBLEMA: '[red]✗[/]', NAO_VERIFICADO: '[yellow]?[/]'}
COR = {PROBLEMA: 'red', NAO_VERIFICADO: 'yellow'}
EMOJI = {OK: '✅', PROBLEMA: '❌', NAO_VERIFICADO: '❔'}


def linha(e, estado, msgs):
    if estado == OK:
        return f"{MARCA[OK]} [dim]{e['jogo']:7}[/] {e['nome']}"
    detalhe = '\n'.join(f'          [{COR[estado]}]{m}[/]' for m in msgs)
    return (f"{MARCA[estado]} [dim]{e['jogo']:7}[/] [bold]{e['nome']}[/]  "
            f"[link=https://youtu.be/{e['vid']}]youtu.be/{e['vid']}[/]\n{detalhe}")


def contagem(lista, resultado):
    c = {OK: 0, PROBLEMA: 0, NAO_VERIFICADO: 0}
    for e in lista:
        c[resultado[e['vid']][0]] += 1
    return c


def frase(lista, c, md=False):
    b = '**' if md else ''
    s = f"{b}{c[OK]}/{len(lista)} rádios OK{b}"
    if c[PROBLEMA]:
        s += f', {c[PROBLEMA]} com problema'
    if c[NAO_VERIFICADO]:
        s += f', {c[NAO_VERIFICADO]} não verificadas'
    return s


def gravar_relatorio(lista, resultado, duracao):
    c = contagem(lista, resultado)
    md = ['# Relatório dos vídeos das rádios', '',
          f'Gerado por `tools/check_videos.py` em {datetime.now():%d/%m/%Y %H:%M} ({duracao:.0f}s).', '',
          frase(lista, c, md=True) + '.', '']
    for estado, titulo, col in [(PROBLEMA, 'Com problema', 'Problema'),
                                (NAO_VERIFICADO, 'Não verificadas (rodar de novo mais tarde)', 'Motivo')]:
        sel = [e for e in lista if resultado[e['vid']][0] == estado]
        if not sel:
            continue
        md += [f'## {titulo}', '', f'| Jogo | Rádio | Vídeo | {col} |', '|---|---|---|---|']
        for e in sel:
            md.append(f"| {e['jogo']} | {e['nome']} | [{e['vid']}](https://youtu.be/{e['vid']}) | "
                      f"{'<br>'.join(resultado[e['vid']][1])} |")
        md.append('')
    md += ['## Todas as rádios', '']
    jogo = None
    for e in lista:
        if e['jogo'] != jogo:
            jogo = e['jogo']
            md += ['', f'### {jogo}', '', '| | Rádio | Vídeo | Duração |', '|---|---|---|---|']
        md.append(f"| {EMOJI[resultado[e['vid']][0]]} | {e['nome']} | "
                  f"[{e['vid']}](https://youtu.be/{e['vid']}) | {fmt(e['dur'])} |")
    RELATORIO.write_text('\n'.join(md) + '\n')


def resumo(lista, resultado):
    tab = Table(title='Resumo por jogo', title_justify='left')
    tab.add_column('Jogo')
    tab.add_column('OK', justify='right', style='green')
    tab.add_column('Problema', justify='right', style='red')
    tab.add_column('Não verif.', justify='right', style='yellow')
    jogos = {}
    for e in lista:
        j = jogos.setdefault(e['jogo'], {OK: 0, PROBLEMA: 0, NAO_VERIFICADO: 0})
        j[resultado[e['vid']][0]] += 1
    for jogo, j in jogos.items():
        tab.add_row(jogo, *(str(n) if n else '[dim]0' for n in j.values()))
    return tab


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--paginas', action='store_true', help='não usar a API; abrir a página de cada vídeo')
    ap.add_argument('-j', '--jobs', type=int, default=4, help='no modo páginas: quantas ao mesmo tempo')
    args = ap.parse_args()

    lista = estacoes()
    chave = None if args.paginas else chave_api()
    if chave:
        lotes = [lista[i:i + LOTE_API] for i in range(0, len(lista), LOTE_API)]
        painel = Painel(len(lista), f'Consultando a API ({len(lotes)} chamadas)')
        trabalhadores = len(lotes)
    else:
        if not args.paginas:
            console.print('[yellow]Sem YOUTUBE_API_KEY: abrindo a página de cada vídeo '
                          '(mais lento e o YouTube pode bloquear).[/]')
        lotes = [[e] for e in lista]
        painel = Painel(len(lista), 'Testando páginas')
        trabalhadores = args.jobs
    resultado = {}

    def pagina(e):
        for espera in ESPERAS_429 + [None]:
            if painel.parar.is_set():
                return e, NAO_VERIFICADO, ['YouTube bloqueou as requisições']
            try:
                probs = checar(e)
                return e, (PROBLEMA if probs else OK), probs
            except Bloqueado as ex:
                if espera is None:
                    painel.parar.set()
                    return e, NAO_VERIFICADO, [str(ex)]
                for falta in range(espera, 0, -1):
                    painel.avisar(e, f'{ex}, tentando de novo em {falta}s')
                    if painel.parar.wait(1):
                        break
                painel.avisar(e, '')
            except Exception as ex:
                return e, NAO_VERIFICADO, [f'erro ao consultar: {ex}']

    def tarefa(lote):
        for e in lote:
            painel.comecou(e)
        return checar_lote_api(lote, chave) if chave else [pagina(lote[0])]

    ini = time.monotonic()
    with Live(painel, console=console, refresh_per_second=12, transient=True), \
         ThreadPoolExecutor(trabalhadores) as pool:
        for fut in as_completed([pool.submit(tarefa, l) for l in lotes]):
            for e, estado, msgs in fut.result():
                resultado[e['vid']] = (estado, msgs)
                painel.terminou(e, estado)
                console.print(linha(e, estado, msgs), highlight=False)
    duracao = time.monotonic() - ini

    c = contagem(lista, resultado)
    console.print()
    console.print(resumo(lista, resultado))
    cor = 'red' if c[PROBLEMA] else 'yellow' if c[NAO_VERIFICADO] else 'green'
    console.print(f'\n[bold {cor}]{frase(lista, c)}[/] [dim]({duracao:.0f}s)[/]')
    if c[NAO_VERIFICADO] and not chave:
        console.print('[yellow]O YouTube limitou as requisições. Espere um pouco e rode de novo, use -j 2 '
                      'ou configure YOUTUBE_API_KEY.[/]')
    gravar_relatorio(lista, resultado, duracao)
    console.print(f'[dim]Relatório salvo em {RELATORIO.relative_to(ROOT)}[/]')
    sys.exit(1 if c[PROBLEMA] else 2 if c[NAO_VERIFICADO] else 0)


if __name__ == '__main__':
    main()
