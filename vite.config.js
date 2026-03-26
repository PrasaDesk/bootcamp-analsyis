import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this repo under: https://<user>.github.io/<repo>/
  // Using a non-root base ensures built asset URLs and React Router work.
  base: '/bootcamp-analsyis/',
  plugins: [react()],
})
