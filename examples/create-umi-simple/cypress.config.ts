import { defineConfig } from 'cypress';
import * as process from 'process';

const PORT = process.env.PORT || '8000';

const isWin = process.platform === 'win32';

export default defineConfig({
  projectId: 'qikpat',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: `http://localhost:${PORT}`,
  },
  defaultCommandTimeout: isWin ? 60000 : 4000,
  retries: {
    runMode: 3,
  },
});
