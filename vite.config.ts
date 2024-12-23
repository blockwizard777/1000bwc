import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  root: '.',  // Root directory for the client app
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/*',  // Copy all files from public/
          dest: '',         // Place them in the root of dist
        }
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // Shortcut for src imports
    },
  },
  build: {
    outDir: 'dist',  // Output to dist inside client directory
    emptyOutDir: true,  // Clean dist folder before each build
    rollupOptions: {
      input: './index.html',  // Include index.html for the build
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',  // Cache busting for assets
      },
    },
  },
  publicDir: 'public',  // Serve static files from public/
});
