import { defineConfig } from 'cypress';

const PORT = process.env.PORT || '8000';

const isWin = process.platform === 'win32';

export default defineConfig({
  projectId: 'qikpat',
  e2e: {
    // @ts-ignore
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: `http://localhost:${PORT}`,
  },
  retries: {
    runMode: 3,
  },
  defaultCommandTimeout: isWin ? 60000 : 4000,
});
