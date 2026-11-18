import { defineConfig } from 'father';
import { join } from 'path';

const runtimeVersion = require(join(process.cwd(), 'package.json'))
  .dependencies?.['@babel/runtime'];

export default defineConfig({
  dts: {
    compiler: 'tsgo',
  },
  cjs: {
    output: 'dist',
  },
  // Father still uses Babel 7 and requests legacy ESM helpers. Apply the same
  // runtime compatibility used by Umi without embedding build-machine paths.
  extraBabelPlugins: runtimeVersion?.startsWith('8.')
    ? [
        [
          require.resolve(
            './packages/bundler-utils/bundles/babel/transformRuntimePublish',
          ),
          {
            absoluteRuntime: false,
            runtimeBaseDir: process.cwd(),
            useESModules: false,
            version: runtimeVersion,
          },
        ],
      ]
    : [],
});
