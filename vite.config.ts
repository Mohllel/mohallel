import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      /** التسجيل يدوي عبر useRegisterSW بالتطبيق نفسه لعرض تنبيه "يتوفر تحديث" بدل الاعتماد على تحديث صامت */
      injectRegister: false,
      includeAssets: ['icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        id: '/',
        name: 'مُحلّل | Mohallel',
        short_name: 'مُحلّل',
        description: 'منصة تحليل مباريات كرة الطائرة',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/',
        display: 'standalone',
        background_color: '#e8eaed',
        theme_color: '#e8eaed',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-maskable-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
})
