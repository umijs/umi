import { defineConfig } from 'cypress';

const PORT = process.env.PORT || '8000';

export default defineConfig({
  e2e: {
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: `http://localhost:${PORT}`,
  },
});
