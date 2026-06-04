import { join } from 'path';

export default {
  npmClient: 'pnpm',
  plugins: [
    join(__dirname, '../../packages/plugins/src/antd'),
    join(__dirname, '../../packages/plugins/src/locale'),
  ],
  antd: {
    momentPicker: true,
    theme: {
      token: {
        colorPrimary: 'green',
        borderRadius: 2,
      },
    },
  },
  locale: {
    default: 'en-US',
    antd: true,
    baseNavigator: false,
  },
  mfsu: false,
  targets: {
    ie: 11,
  },
  legacy: {},
};
