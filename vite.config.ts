import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
  // ...other configurations if any
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        '/favicon.ico',
        '/apple-touch-icon.png',
        '/icons/*.png',
        '/fonts/*.ttf',
      ],
      manifest: {
        theme_color: '#f69435',
        background_color: '#f69435',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        name: 'Vite PWA Example',
        short_name: 'Vite PWA',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Optional: Customize your caching strategies
      },
    }),
  ],
});
