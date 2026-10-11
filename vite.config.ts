import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'serve-and-copy-assets',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = req.url?.split('?')[0] || '';
          if (rawUrl.startsWith('/assets/')) {
            const relPath = rawUrl.replace(/^\//, '');
            const filePath = path.resolve(__dirname, relPath);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.mp3': 'audio/mpeg',
                '.ogg': 'audio/ogg',
                '.wav': 'audio/wav',
                '.svg': 'image/svg+xml',
                '.json': 'application/json',
              };
              if (mimeMap[ext]) {
                res.setHeader('Content-Type', mimeMap[ext]);
              }
              return fs.createReadStream(filePath).pipe(res);
            }
          }
          next();
        });
      },
      closeBundle() {
        const src = path.resolve(__dirname, 'assets');
        const dest = path.resolve(__dirname, 'dist/assets');
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true });
          console.log('✅ [Build] Successfully copied assets to dist/assets');
        }
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
  },
});
