import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    },
    fs: {
      strict: false,
    },
  },
  build: {
    sourcemap: false
  },
});
