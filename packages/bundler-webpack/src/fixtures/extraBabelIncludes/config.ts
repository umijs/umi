import { join } from 'path';

export default {
  nodeModulesTransform: {
    type: 'none',
  },
  extraBabelIncludes: [join(__dirname, '../.extraBabelIncludes'), 'foo', 'bar'],
};
