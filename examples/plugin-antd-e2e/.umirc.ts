import { join } from 'path';

export default {
  npmClient: 'pnpm',
  plugins: [join(__dirname, '../../packages/plugins/src/antd')],
  antd: {
    momentPicker: true,
    appConfig: {},
    proxyStaticMethod: true,
  },
  mfsu: false,
};
