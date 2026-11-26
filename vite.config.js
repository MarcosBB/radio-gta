import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { LANGUAGES, DEFAULT_LANG, SITE_URL, SITE_NAME, langPath } from './src/config.js'

const locale = (code) => JSON.parse(readFileSync(new URL(`./src/locales/${code}.json`, import.meta.url)))
const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function headFor(lang) {
  const { meta } = locale(lang.code)
  const url = SITE_URL + langPath(lang.code)
  const alternates = LANGUAGES.map((l) => `<link rel="alternate" hreflang="${l.html}" href="${SITE_URL}${langPath(l.code)}">`)
  alternates.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">`)
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, alternateName: ['GTA Radio Wheel'], url: `${SITE_URL}/` },
    {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: SITE_NAME, alternateName: 'GTA Radio Wheel', url,
      image: `${SITE_URL}/og.jpg`, description: meta.description, inLanguage: lang.html,
      applicationCategory: 'MultimediaApplication', operatingSystem: 'Any', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ]
  return [
    `<title>${escape(meta.title)}</title>`,
    `<meta name="description" content="${escape(meta.description)}">`,
    `<link rel="canonical" href="${url}">`,
    ...alternates,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:title" content="${escape(meta.ogTitle)}">`,
    `<meta property="og:description" content="${escape(meta.ogDescription)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:locale" content="${lang.og}">`,
    ...LANGUAGES.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${l.og}">`),
    `<meta property="og:image" content="${SITE_URL}/og.jpg">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escape(meta.ogImageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${SITE_URL}/og.jpg">`,
    ...ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`),
  ].join('\n    ')
}

const pageFor = (html, lang) => html
  .replace(/<html[^>]*>/, `<html lang="${lang.html}" dir="${lang.rtl ? 'rtl' : 'ltr'}">`)
  .replace('<!--seo-head-->', headFor(lang))

function sitemap() {
  const urls = LANGUAGES.map((lang) => {
    const links = LANGUAGES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.html}" href="${SITE_URL}${langPath(l.code)}"/>`)
    links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>`)
    return `  <url>\n    <loc>${SITE_URL}${langPath(lang.code)}</loc>\n${links.join('\n')}\n    <changefreq>monthly</changefreq>\n  </url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}

// One static page per language, so search engines see translated titles, descriptions and hreflang.
function languagePages() {
  const byCode = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]))
  let outDir = 'dist'
  return {
    name: 'language-pages',
    configResolved(config) { outDir = config.build.outDir },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const code = ctx.originalUrl?.split('/')[1]
        return pageFor(html, byCode[code] || byCode[DEFAULT_LANG])
      },
    },
    closeBundle() {
      const root = readFileSync(`${outDir}/index.html`, 'utf8')
      const base = pageFor(root, byCode[DEFAULT_LANG])
      for (const lang of LANGUAGES) {
        if (lang.code === DEFAULT_LANG) continue
        const html = base
          .replace(/<html[^>]*>/, `<html lang="${lang.html}" dir="${lang.rtl ? 'rtl' : 'ltr'}">`)
          .replace(/<title>[\s\S]*?<script type="application\/ld\+json">[\s\S]*?<\/script>\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, headFor(lang))
        mkdirSync(`${outDir}/${lang.code}`, { recursive: true })
        writeFileSync(`${outDir}/${lang.code}/index.html`, html)
      }
      writeFileSync(`${outDir}/sitemap.xml`, sitemap())
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    languagePages(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon.png', 'sounds/sintonia.m4a'],
      manifest: {
        name: SITE_NAME,
        short_name: SITE_NAME,
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0b0b10',
        theme_color: '#0b0b10',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,m4a,ico}'],
        globIgnores: ['logos/**'],
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/],
        runtimeCaching: [{
          urlPattern: ({ url }) => url.pathname.startsWith('/logos/'),
          handler: 'CacheFirst',
          options: { cacheName: 'logos', expiration: { maxEntries: 200 } },
        }],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { host: true },
})
