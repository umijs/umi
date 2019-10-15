
import { join } from 'path';

export default {
  ssr: true,
  plugins: [
    [
      join(__dirname, '..', '..', '..', '..', 'umi-plugin-react', 'lib', 'index.js'),
      {
        dynamicImport: {
          webpackChunkName: true,
        },
      }
    ]
  ]
}
