import { defineConfig } from 'vite';

export default defineConfig({
  base: 'Alex-s-API-weather-dashboard',
  build: {
    outDir: 'Dist', // Ensures output folder is 'dist'
  },
  server: {
    port: 3000,
    open: true,
  },
});