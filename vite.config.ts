import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 设置为相对路径，这对 GitHub Pages 部署至关重要
  base: './',
});