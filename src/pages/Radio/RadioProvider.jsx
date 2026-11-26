import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_GAME, DEFAULT_VOLUME, MIN_TUNING_MS, PLAY_TIMEOUT_MS, PRESET_COUNT } from '@/config'
import { getGamesData, getStationById, getStationsData, loadSongsData, spotifyUrl } from '@/services/contentService'
import { useStoredState } from '@/hooks/useStoredState'
import { useFavorites } from '@/hooks/useFavorites'
import { useTuningStatic } from '@/hooks/useTuningStatic'
import { useKeepAlive } from '@/hooks/useKeepAlive'
import { useYouTubePlayer, YT_STATE } from '@/hooks/useYouTubePlayer'
import { livePosition, trackAt } from '@/utils/live'
import { storage } from '@/utils/storage'

const RadioContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components
export const useRadio = () => useContext(RadioContext)

export const OFF = 'off'

export function RadioProvider({ children }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const games = useMemo(() => getGamesData(), [])
  const [storedGame, setGameId] = useStoredState('game', DEFAULT_GAME)
  const gameId = games.some((g) => g.id === storedGame) ? storedGame : DEFAULT_GAME
  const game = games.find((g) => g.id === gameId)
  const stations = useMemo(() => getStationsData(gameId, lang), [gameId, lang])

  const [started, setStarted] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [previewId, setPreviewId] = useState(null)
  const [status, setStatus] = useState('off')
  const [usingFallback, setUsingFallback] = useState(false)
  const [volume, setVolumeState] = useStoredState('vol', DEFAULT_VOLUME)
  const [lastStation, setLastStation] = useStoredState('lastStation', {})
  const [presets, setPresets] = useStoredState('presets', Array(PRESET_COUNT).fill(null))
  const [ytSize, setYtSize] = useStoredState('ytSize', 'mini')
  const [ytHidden, setYtHidden] = useStoredState('ytHidden', false)
  const [track, setTrack] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [tracksLoaded, setTracksLoaded] = useState(false)
  const { favorites, toggleFavorite } = useFavorites()

  const startedRef = useRef(false)
  const volumeRef = useRef(volume)
  const lastVolume = useRef(volume || DEFAULT_VOLUME)
  const playing = useRef(null)
  const pending = useRef(null)
  const timers = useRef({})
  const failed = useRef(new Set())
  const durations = useRef(storage.get('durs', {}))
  const tracks = useRef(new Map())
  const toastTimer = useRef(null)
  const actions = useRef({})

  const staticFx = useTuningStatic(volumeRef)
  const keepAlive = useKeepAlive()

  const { hostRef: playerHostRef, player, ready } = useYouTubePlayer({
    onReady: () => { if (pending.current) actions.current.load(playing.current.station, playing.current.idx) },
    onStateChange: (state) => {
      if (state === YT_STATE.PLAYING) actions.current.onPlaying()
      if (state === YT_STATE.ENDED && playing.current) {
        player.current.seekTo(0, true)
        player.current.playVideo()
      }
    },
    onError: () => actions.current.videoFailed(),
  })
  const readyRef = useRef(false)
  useEffect(() => { readyRef.current = ready }, [ready])

  const currentStation = useMemo(() => (currentId ? getStationById(currentId, lang) : null), [currentId, lang])

  const toast = useCallback((msg) => {
    setToastMsg({ msg, key: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800)
  }, [])

  const durationOf = (video) => video.duration || durations.current[video.id] || 0

  const clearTimers = () => {
    for (const k of Object.keys(timers.current)) {
      clearTimeout(timers.current[k])
      clearInterval(timers.current[k])
    }
    timers.current = {}
  }

  const fadeIn = () => {
    const p = player.current
    let v = 0
    p.setVolume(0)
    clearInterval(timers.current.fadeIn)
    timers.current.fadeIn = setInterval(() => {
      v = Math.min(volumeRef.current, v + volumeRef.current / 8)
      p.setVolume(v)
      if (v >= volumeRef.current) clearInterval(timers.current.fadeIn)
    }, 50)
  }

  const load = (station, idx) => {
    const video = station.videos[idx]
    const tunedAt = pending.current?.stationId === station.id ? pending.current.tunedAt : performance.now()
    pending.current = { stationId: station.id, tunedAt }
    playing.current = { station, video, idx }
    setUsingFallback(idx > 0)
    clearTimeout(timers.current.load)
    clearTimeout(timers.current.timeout)
    timers.current.load = setTimeout(() => {
      if (!readyRef.current) return
      player.current.loadVideoById({
        videoId: video.id,
        startSeconds: Math.floor(livePosition(video.id, durationOf(video))),
        suggestedQuality: 'small',
      })
    }, 120)
    timers.current.timeout = setTimeout(() => actions.current.videoFailed(), PLAY_TIMEOUT_MS)
  }

  const videoFailed = () => {
    const p = playing.current
    if (!p) return
    failed.current.add(p.video.id)
    const next = p.station.videos.findIndex((v) => !failed.current.has(v.id))
    if (next >= 0) {
      if (!pending.current) {
        pending.current = { stationId: p.station.id, tunedAt: performance.now() }
        staticFx.start()
        setStatus('tuning')
      }
      load(p.station, next)
      return
    }
    pending.current = null
    clearTimeout(timers.current.timeout)
    staticFx.stop(0.2)
    setStatus('error')
  }

  const onPlaying = () => {
    const p = playing.current
    const pend = pending.current
    if (!p || !pend || pend.stationId !== p.station.id) return
    const pl = player.current
    const real = Math.floor(pl.getDuration() || 0)
    if (real > 60 && durations.current[p.video.id] !== real) {
      durations.current[p.video.id] = real
      storage.set('durs', durations.current)
    }
    const want = livePosition(p.video.id, durationOf(p.video))
    if (Math.abs(pl.getCurrentTime() - want) > 4) pl.seekTo(want, true)
    pending.current = null
    clearTimeout(timers.current.timeout)
    const wait = Math.max(0, MIN_TUNING_MS - (performance.now() - pend.tunedAt))
    timers.current.settle = setTimeout(() => {
      staticFx.stop(0.35)
      fadeIn()
      setStatus('on')
    }, wait)
  }

  const tune = (id) => {
    if (!startedRef.current) return
    staticFx.init()
    setPreviewId(null)
    if (id === (playing.current?.station.id ?? null) && status !== 'error') return
    clearTimers()
    const station = id ? getStationById(id, lang) : null
    setCurrentId(id)
    if (!station) {
      playing.current = null
      pending.current = null
      staticFx.stop(0.05)
      staticFx.burst()
      if (readyRef.current) {
        player.current.setVolume(0)
        player.current.pauseVideo()
      }
      keepAlive.pause()
      setStatus('off')
      setTrack(null)
      return
    }
    setLastStation((prev) => ({ ...prev, [station.game]: station.id }))
    staticFx.start()
    setStatus('tuning')
    if (readyRef.current) player.current.setVolume(0)
    pending.current = null
    let idx = station.videos.findIndex((v) => !failed.current.has(v.id))
    if (idx < 0) {
      station.videos.forEach((v) => failed.current.delete(v.id))
      idx = 0
    }
    load(station, idx)
    keepAlive.play()
  }

  const stationsOf = (gid) => (gid === gameId ? stations : getStationsData(gid, lang))
  const firstStationOf = (gid) => {
    const list = stationsOf(gid)
    const last = lastStation[gid]
    return list.some((s) => s.id === last) ? last : list[0]?.id ?? null
  }

  const start = () => {
    if (startedRef.current) return
    startedRef.current = true
    setStarted(true)
    keepAlive.play()
    staticFx.init()
    loadSongsData().then((map) => {
      tracks.current = map
      setTracksLoaded(true)
    })
    tune(firstStationOf(gameId))
  }

  const switchGame = (gid, stationId) => {
    setGameId(gid)
    setPreviewId(null)
    if (startedRef.current) tune(stationId ?? firstStationOf(gid))
  }

  const cycleGame = (dir) => {
    const i = games.findIndex((g) => g.id === gameId)
    switchGame(games[(i + dir + games.length) % games.length].id)
  }

  const step = (dir) => {
    if (!startedRef.current) return
    const base = previewId ?? currentId ?? OFF
    const ids = [OFF, ...stations.map((s) => s.id)]
    const i = Math.max(0, ids.indexOf(base))
    const next = ids[(i + dir + ids.length) % ids.length]
    setPreviewId(next)
    clearTimeout(timers.current.step)
    timers.current.step = setTimeout(() => actions.current.tune(next === OFF ? null : next), 380)
  }

  const togglePower = () => {
    if (!startedRef.current) return start()
    if (currentId) tune(null)
    else tune(firstStationOf(gameId))
  }

  const setVolume = (v) => {
    const value = Math.max(0, Math.min(100, Math.round(v)))
    if (value > 0) lastVolume.current = value
    volumeRef.current = value
    setVolumeState(value)
    clearInterval(timers.current.fadeIn)
    if (readyRef.current && playing.current && status === 'on') player.current.setVolume(value)
  }
  const toggleMute = () => setVolume(volume === 0 ? lastVolume.current : 0)

  const recallPreset = (k) => {
    if (!startedRef.current) return
    const id = presets[k]
    const station = id && getStationById(id, lang)
    if (!station) return toast(t('presets.empty', { n: k + 1 }))
    if (station.game !== gameId) switchGame(station.game, id)
    else tune(id)
  }

  const savePreset = (k) => {
    if (!currentStation) {
      toast(t('presets.needTune'))
      return false
    }
    setPresets((prev) => prev.map((p, i) => (i === k ? currentStation.id : p)))
    if (navigator.vibrate) navigator.vibrate(30)
    toast(t('presets.saved', { name: currentStation.name, n: k + 1 }))
    return true
  }

  const toggleFavoriteStation = (id) => {
    const station = getStationById(id, lang)
    if (!station) return
    const added = toggleFavorite(id)
    toast(t(added ? 'favorites.added' : 'favorites.removed', { name: station.name }))
  }

  // Timers and player events outlive a render, so they call the latest handlers through this ref.
  useLayoutEffect(() => {
    actions.current = { load, videoFailed, onPlaying, tune, step, togglePower, recallPreset }
  })

  // The song playing now, from the tracklist of the video that is actually playing.
  useEffect(() => {
    if (status === 'off' || !tracksLoaded) return
    const tick = () => {
      const p = playing.current
      if (!p) return
      let pos = livePosition(p.video.id, durationOf(p.video))
      const pl = player.current
      if (status === 'on' && pl?.getPlayerState?.() === YT_STATE.PLAYING) pos = pl.getCurrentTime()
      const found = trackAt(tracks.current.get(p.video.id), pos)
      setTrack((prev) => (prev?.start === found?.start && prev?.raw === found?.raw ? prev : found))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentId, tracksLoaded, usingFallback])

  useEffect(() => {
    const root = document.documentElement.style
    if (currentStation) {
      root.setProperty('--c1', currentStation.colors[0])
      root.setProperty('--c2', currentStation.colors[1])
    }
    document.body.classList.toggle('radio-off', !currentStation)
  }, [currentStation])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    if (!currentStation) {
      ms.metadata = null
      ms.playbackState = 'paused'
      return
    }
    const song = track?.isSong ? track : null
    ms.metadata = new MediaMetadata({
      title: song ? song.title : currentStation.name,
      artist: song ? song.artist : currentStation.genre,
      album: `${currentStation.name} · ${games.find((g) => g.id === currentStation.game)?.fullName}`,
      artwork: currentStation.logo ? [{ src: new URL(currentStation.logo, location.href).href, sizes: '256x256' }] : [],
    })
    ms.playbackState = 'playing'
  }, [currentStation, track, games])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    const set = (action, fn) => { try { ms.setActionHandler(action, fn) } catch { /* unsupported action */ } }
    set('nexttrack', () => actions.current.step(1))
    set('previoustrack', () => actions.current.step(-1))
    set('seekforward', () => actions.current.step(1))
    set('seekbackward', () => actions.current.step(-1))
    set('pause', () => { if (playing.current) actions.current.tune(null) })
    set('stop', () => { if (playing.current) actions.current.tune(null) })
    set('play', () => { if (!playing.current) actions.current.togglePower() })
  }, [])

  const value = {
    games, game, gameId, stations, started, currentId, currentStation, previewId, status, usingFallback,
    volume, track, spotify: spotifyUrl(track), presets, favorites, ytSize, ytHidden, toastMsg, playerHostRef,
    start, tune, step, togglePower, switchGame, cycleGame, setVolume, toggleMute, recallPreset, savePreset,
    toggleFavorite: toggleFavoriteStation, setYtSize, setYtHidden, toast,
  }

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>
}
