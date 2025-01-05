import { defineConfig } from 'vite';

// https://vitejs.dev/config/
/* export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}); */

export default defineConfig({
  base: 'Alex-s-API-weather-dashboard',
  build: {
    outDir: 'dist', // Ensures output folder is 'dist'
  },
  server: {
    port: 3000,
    open: true,
  },
});