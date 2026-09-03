import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetFallbackPlugin() {
  return {
    name: 'figma-asset-fallback',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        return path.resolve(__dirname, './src/imports', id.replace('figma:asset/', ''))
      }
      if (id === 'figma:foundry-client-api') {
        return id
      }
      return null
    },
    load(id: string) {
      if (id === 'figma:foundry-client-api') {
        return 'export {}'
      }
      return null
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [
    figmaAssetFallbackPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
})
