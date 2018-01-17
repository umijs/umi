import { resolve } from 'path';

export default {
  alias: {
    mixin: resolve(__dirname, 'common/mixin.less'),
  },
  manifest: {
    basePath: '/app/',
  },
  // ./static by default
  // publicPath: './static/',
  // publicPath: '/dist/static/',
  // publicPath: 'http://localhost:8888/dist/static/',
};
