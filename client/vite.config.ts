import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import stylex from '@stylexjs/unplugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    stylex.vite({
      useCSSLayers: true,
    }),
    react()],
})
