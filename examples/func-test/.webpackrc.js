import { resolve } from 'path';

export default {
  alias: {
    common: resolve(__dirname, 'common'),
  },
  manifest: {
    basePath: '/app/',
  },
  theme: {
    'brand-primary': '#7546c9',
  },
  // publicPath: '/static/',
  // ./static by default
  // publicPath: './static/',
  // publicPath: '/dist/static/',
  // publicPath: 'http://localhost:8888/dist/static/',
};
