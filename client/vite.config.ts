import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  root: '.', // The root directory for the client-side app
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/*', // Copy all files from /client/public
          dest: '', // Copy to the root of the dist folder
        },
        {
          src: '../server/assets/**/*', // Copy all files in /server/assets
          dest: 'assets', // Copy to /dist/assets
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias for cleaner imports
    },
  },
  build: {
    outDir: '../dist', // Output directory at project-root/dist
    emptyOutDir: true, // Clear dist folder before each build
    rollupOptions: {
      input: './index.html', // Ensure Vite includes index.html
      output: {
        assetFileNames: 'assets/[name].[hash][extname]', // Organize CSS/images in /assets
      },
    },
  },
  publicDir: 'public', // Static files location
});
