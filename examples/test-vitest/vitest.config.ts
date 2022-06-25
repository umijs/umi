import react from '@vitejs/plugin-react';
import { getUmiAlias } from 'umi/test';
import { defineConfig } from 'vitest/config';

export default async () =>
  defineConfig({
    test: {
      include: ['./**/*.test.{ts,tsx}'],
      globals: true,
      environment: 'jsdom',
    },
    alias: await getUmiAlias(),
    plugins: [react()],
  });
