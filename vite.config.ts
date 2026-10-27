import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
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
      proxy: {
        '/api/wingo30s': {
          target: 'https://draw.ar-lottery01.com',
          changeOrigin: true,
          rewrite: () => '/WinGo/WinGo_30S/GetHistoryIssuePage.json',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://ar-lottery01.com/',
            'Accept': 'application/json, text/plain, */*'
          }
        },
        '/api/wingo1m': {
          target: 'https://draw.ar-lottery01.com',
          changeOrigin: true,
          rewrite: () => '/WinGo/WinGo_1M/GetHistoryIssuePage.json',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://ar-lottery01.com/',
            'Accept': 'application/json, text/plain, */*'
          }
        }
      }
    },
  };
});
