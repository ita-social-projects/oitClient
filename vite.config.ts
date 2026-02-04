import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { loadEnv } from 'vite';
import type { ConfigEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const viteConfig = ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/shared/components'),
        '@services': path.resolve(__dirname, 'src/shared/services'),
        '@hooks': path.resolve(__dirname, 'src/shared/hooks'),
        '@styles': path.resolve(__dirname, 'src/shared/styles'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@types': path.resolve(__dirname, 'src/shared/types'),
      },
    },
    test: {
      include: ['**/*.test.tsx'],
      globals: true,
      setupFiles: './src/setupTests.ts',
      environment: 'jsdom',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        reportsDirectory: './coverage',
        exclude: ['node_modules/', 'src/main.tsx'],
      },
    },
  });
};

export default viteConfig;
