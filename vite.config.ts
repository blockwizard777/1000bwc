import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/*',
          dest: '',
        }
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',  // Output directory for production
    emptyOutDir: true,
    rollupOptions: {
      input: './index.html',  // Ensures index.html is included in build
    },
  },
  publicDir: 'public',  // Serve static files from public
});
