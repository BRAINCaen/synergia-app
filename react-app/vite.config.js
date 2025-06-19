import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', // ou supprimez cette ligne si index.html est à la racine
  build: {
    outDir: 'dist'
  }
})
