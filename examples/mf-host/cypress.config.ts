import { defineConfig } from 'cypress';

const PORT = process.env.PORT || '8000';

export default defineConfig({
  projectId: 'qikpat',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: `http://localhost:${PORT}`,
  },
});
