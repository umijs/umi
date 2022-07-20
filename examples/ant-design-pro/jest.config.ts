import { configUmiAlias, createConfig } from '@umijs/max/test';

export default async () => {
  const config = await configUmiAlias({
    ...createConfig({
      target: 'browser',
      jsTransformerConfig: {
        esBuildConfig: {
          jsxFactory: 'React.createElement',
        },
      },
    }),
  });
  return {
    ...config,
    testEnvironmentOptions: {
      ...(config?.testEnvironmentOptions || {}),
      url: 'http://localhost:8000',
    },
    moduleNameMapper: {
      ...config.moduleNameMapper,
      '^@/(.*)$': '<rootDir>/src/$1',
      '.(css|less)$': 'identity-obj-proxy',
    },
    transformIgnorePatterns: [
      '/node_modules/(?!antd|@ant-design|rc-.+?|@babel/runtime|@umijs/renderer-react|@umijs/preset-umi|umi).+(js|jsx)$',
    ],
    setupFiles: [...(config.setupFiles || []), './tests/setupTests.jsx'],
    globals: {
      ...config.globals,
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: false,
      localStorage: null,
    },
  };
};
