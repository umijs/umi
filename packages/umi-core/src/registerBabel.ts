import { join } from 'path';
import slash2 from 'slash2';

export default function(cwd, extraFiles = []) {
  const umiEnv = process.env.UMI_ENV;
  require('@babel/register')({
    presets: [
      require.resolve('@babel/preset-typescript'),
      [
        require.resolve('babel-preset-umi'),
        {
          env: { targets: { node: 8 } },
          transformRuntime: false,
        },
      ],
    ],
    ignore: [/node_modules/],
    only: [
      join(cwd, 'config'),
      join(cwd, '.umirc.js'),
      join(cwd, '.umirc.ts'),
      ...(umiEnv ? [join(cwd, `.umirc.${umiEnv}.js`), join(cwd, `.umirc.${umiEnv}.ts`)] : []),
    ]
      .concat(extraFiles)
      .map(file => slash2(file)),
    extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],
    babelrc: false,
    cache: false,
  });
}
