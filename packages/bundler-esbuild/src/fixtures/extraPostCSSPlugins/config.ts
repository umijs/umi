import { join } from 'path';
import px2rem from '@alitajs/postcss-plugin-px2rem';

export default {
  alias: {
    antd: join(__dirname, 'path'),
  },
  extraPostCSSPlugins:[
    px2rem({
      rootValue: 100,
      minPixelValue: 2,
      selectorDoubleRemList: [/.ant-/],
    }),
  ]
};
