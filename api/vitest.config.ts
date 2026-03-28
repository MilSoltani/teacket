import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          include: ['**/*.int.test.ts'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          include: ['**/*.unit.test.ts'],
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@api': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
