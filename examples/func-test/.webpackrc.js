import { resolve } from 'path';

export default {
  alias: {
    mixin: resolve(__dirname, 'common/mixin.less'),
  },
  manifest: {
    basePath: '/app/',
  },
};
