import { configUmiAlias, createConfig } from '@umijs/max/test';

export default async () => {
  const config = await configUmiAlias({
    ...createConfig({
      target: 'browser',
    }),
  });
  const esModules = [].join('|');
  return {
    ...config,
    testEnvironmentOptions: {
      ...(config?.testEnvironmentOptions || {}),
      url: 'http://localhost:8000',
    },
    transformIgnorePatterns: [
      ...(config.transformIgnorePatterns || []),
      `/node_modules/(?!${esModules})`,
    ],
    setupFiles: [...(config.setupFiles || []), './tests/setupTests.jsx'],
    globals: {
      ...config.globals,
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: false,
      localStorage: null,
    },
  };
};
