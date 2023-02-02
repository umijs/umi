import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import baseConfig from '../../playwright.base.config';

const config: PlaywrightTestConfig = {
  ...baseConfig,
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:8006',
      },
    },
  ],
};

export default config;
