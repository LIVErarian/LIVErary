import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://i14a307.p.ssafy.io:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      // @를 src 폴더의 절대 경로로 매핑
      '@': path.resolve(__dirname, './src'),
    },
  },
});
