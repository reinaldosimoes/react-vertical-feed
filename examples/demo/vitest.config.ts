import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/react-vertical-feed/',
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.tsx', 'scripts/**/*.test.ts'],
    setupFiles: ['./src/test-setup.ts'],
  },
});
