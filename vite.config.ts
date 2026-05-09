import path from 'node:path';

import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'css',
          exclude: /^ElMessage2$/,
        }),
      ],
      dts: 'src/types/auto-imports.d.ts',
    }),
    Components({
      resolvers: [
        ElementPlusResolver({
          importStyle: 'css',
          exclude: /^ElMessage2$/,
        }),
      ],
      dts: 'src/types/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // 本地开发代理：在 /api/* 转发到后端 3000 并去掉前缀 /api
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
