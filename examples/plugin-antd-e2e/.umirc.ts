import { join } from 'path';

export default {
  npmClient: 'pnpm',
  plugins: [join(__dirname, '../../packages/plugins/src/antd')],
  antd: {
    momentPicker: true,
    theme: {
      token: {
        colorPrimary: 'green',
      },
    },
  },
  mfsu: false,
};
