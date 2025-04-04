// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': {
        target: 'http://192.168.151.231:1234', // Endereço e porta do LMStudio
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat/, '/v1/chat/completions'), // Redireciona para o endpoint correto
      },
    },
  },
});