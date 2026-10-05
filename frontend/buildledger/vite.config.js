import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fileURLToPath from 'url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from workspace root if present, or current directory
  const rootEnvDir = path.resolve(process.cwd(), '../../');
  const env = loadEnv(mode, rootEnvDir, '');

  const port = parseInt(env.VITE_PORT || env.PORT || '5173', 10);

  return {
    plugins: [react()],
    envDir: rootEnvDir,
    server: {
      port: port,
      host: true
    }
  }
})
