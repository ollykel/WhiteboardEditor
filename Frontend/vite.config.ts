import { defineConfig } from 'vite'
import { fileURLToPath } from 'url';
import path from 'path';
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite';

// TypeScript workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port at which to redirect proxy
const SERVER_PORT = process.env.WHITEBOARD_EDITOR_HTTP_PORT || '8080';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true
      },
      '/ws': {
        target: `http://localhost:${SERVER_PORT}`,
        ws: true,
        changeOrigin: true
      }
    }
  }
})
