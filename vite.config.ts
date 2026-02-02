import { loadEnv} from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc'
import type { ConfigEnv } from 'vite'

const viteConfig = ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false
        }
      }
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
      }
    }
  });
};

export default viteConfig;
