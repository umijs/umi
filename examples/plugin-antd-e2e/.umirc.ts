import { join } from 'path';

export default {
  npmClient: 'pnpm',
  plugins: [join(__dirname, '../../packages/plugins/src/antd')],
  antd: {
    momentPicker: true,
    theme: {
      token: {
        colorPrimary: 'green',
        borderRadius: 2,
      },
    },
  },
  mfsu: false,
  targets: {
    ie: 11,
  },
  legacy: {},
};
