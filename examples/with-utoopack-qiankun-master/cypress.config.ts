import { defineConfig } from 'cypress';

const PORT = process.env.PORT || '8890';

const isWin = process.platform === 'win32';

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${PORT}`,
  },
  retries: {
    runMode: 3,
  },
  defaultCommandTimeout: isWin ? 60000 : 4000,
});
