import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        injectRegister: null,
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'Super Mario Labor Adventure | PH Labor Standards Guide',
          short_name: 'MarioLaw',
          description:
            'Comprehensive Philippine Labor Law Memory Aid with interactive map, statutory calculators, flashcards, quizzes, and arcade games.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'vite8-pwa-hmr-guard',
        enforce: 'pre',
        resolveId(id) {
          if (id === '/@vite-plugin-pwa/pwa-entry-point-loaded') {
            return '\0safe-pwa-entry-point-loaded';
          }
          return undefined;
        },
        load(id) {
          if (id === '\0safe-pwa-entry-point-loaded') {
            if (process.env.DISABLE_HMR === 'true') {
              return 'export default function registerDevSW() {}';
            }
            return `export default function registerDevSW() {
  if (import.meta.hot && typeof import.meta.hot.send === 'function') {
    Promise.resolve()
      .then(() => import.meta.hot.send('vite-pwa-plugin:dev-ready'))
      .catch(() => {});
  }
}`;
          }
          return undefined;
        },
      },
      {
        name: 'vite8-pwa-strip-dev-hmr-script',
        enforce: 'post',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            if (process.env.DISABLE_HMR === 'true') {
              return html.replace(
                /<script id="vite-plugin-pwa:register-dev-sw"[^>]*>[\s\S]*?<\/script>/g,
                ''
              );
            }
            return html;
          },
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
