import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./netlify/framework/tests/setup.ts'],
    include: ['netlify/framework/**/*.test.ts', 'netlify/project/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'test-npm-pkg/**'
    ],
    coverage: {
      provider: 'v8',
      all: false,
      include: ['netlify/framework/**/*.{ts,tsx}', 'netlify/project/**/*.{ts,tsx}'],
      exclude: [
        '**/tests/**',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        'test-npm-pkg/**'
      ],
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage'
    },
    testTimeout: 10000,
    reporters: ['verbose']
  },
  resolve: {
    alias: {
      '@framework': resolve(__dirname, './netlify/framework'),
      '@project': resolve(__dirname, './netlify/project'),
      '@functions': resolve(__dirname, './netlify/functions')
    }
  }
})
