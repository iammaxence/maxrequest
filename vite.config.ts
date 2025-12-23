import path from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack'
import manifest from './manifest.config.ts'
import { name, version } from './package.json'

export default defineConfig({
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
  plugins: [
    vue(),
    crx({ manifest }),
    zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
  ],
  server: {
    cors: {
      origin: [
        /chrome-extension:\/\//,
      ],
    },
  },
  build: {
    rollupOptions: {
      input: {
        // Force the compiler to recognize inject.ts
        interceptor: 'src/content/inject.ts',
      },
      output: {
        // This forces the filename to stay exactly as "interceptor.js"
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'interceptor' 
            ? 'assets/[name].js' 
            : 'assets/[name]-[hash].js';
        },
      },
    },
  },
})
