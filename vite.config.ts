import { defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'
import type { ConfigEnv } from 'vite'

// https://vite.dev/config/
export default ({ mode }: ConfigEnv) => {
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
    }
  })
}
