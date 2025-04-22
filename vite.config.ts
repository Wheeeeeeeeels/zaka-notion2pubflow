import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

// 获取项目根目录
const root = resolve(__dirname);

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        // Main process
        entry: resolve(root, 'src/main/index.ts'),
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: resolve(root, 'out/main'),
            minify: false,
            rollupOptions: {
              external: ['electron', 'fs']
            }
          }
        }
      },
      {
        // Preload script
        entry: resolve(root, 'src/preload/index.ts'),
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: resolve(root, 'out/preload'),
            minify: false
          }
        }
      }
    ]),
    renderer()
  ],
  root: resolve(root, 'src/renderer'),
  publicDir: resolve(root, 'public'),
  build: {
    outDir: resolve(root, 'out/renderer'),
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true,
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:5173 ws://localhost:5173;"
    }
  },
  resolve: {
    alias: {
      '@': resolve(root, 'src')
    }
  },
  base: './',
  optimizeDeps: {
    include: ['vue'],
    exclude: ['electron']
  }
}); 