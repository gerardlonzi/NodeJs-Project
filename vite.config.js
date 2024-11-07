import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', 
  build: {
    outDir: './public/dist',
    rollupOptions: {
      input: './js/tiplap.js',
    },
  },
  server: {
    port: 5000,
  },
});