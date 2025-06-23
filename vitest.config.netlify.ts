import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['netlify/framework/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'netlify/project/**'
    ],
    coverage: {
      provider: 'v8',
      all: false, // <--- to jest kluczowe!
      include: ['netlify/framework/**/*.{ts,tsx}'],
      exclude: [
        '**/tests/**',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        'netlify/project/**'
      ]
    },
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './netlify/functions')
    }
  }
})
