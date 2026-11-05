import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // The app is served from https://<user>.github.io/Novious-MovieExplorer/,
  // not from the domain root, so every built asset URL needs this prefix.
  // It must match the repository name exactly.
  base: '/Novious-MovieExplorer/',
  plugins: [
    react(),
    tailwindcss()
  ],
})
