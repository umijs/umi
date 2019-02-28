import { basename, extname, join } from 'path';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import { RollupOptions } from 'rollup';
import tempDir from 'temp-dir';
import getBabelConfig from './getBabelConfig';

interface IGetRollupConfigOpts {
  cwd: string;
  entry: string;
  type: 'esm' | 'cjs' | 'umd';
  target: 'browser' | 'node';
}

interface IPkg {
  dependencies?: Object;
  peerDependencies?: Object;
}

export default function (opts: IGetRollupConfigOpts): RollupOptions[] {
  const { type, entry, cwd, target } = opts;
  const entryExt = extname(entry);
  const name = basename(entry, entryExt);
  const isTypeScript = entryExt === '.ts' || entryExt === '.tsx';

  let pkg = {} as IPkg;
  try {
    pkg = require(join(cwd, 'package.json')); // eslint-disable-line
  } catch (e) {
  }

  // rollup configs
  const input = join(cwd, entry);
  const format = type;
  const external = type === 'umd'
    // umd 只要 external peerDependencies
    ? [
      ...Object.keys(pkg.peerDependencies || {}),
    ]
    : [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ];
  const plugins = [
    // TODO:
    // 1. postcss
    ...(isTypeScript ? [typescript({
      cacheRoot: `${tempDir}/.rollup_plugin_typescript2_cache`,
      // TODO: 支持往上找 tsconfig.json
      // 比如 lerna 的场景不需要每个 package 有个 tsconfig.json
      tsconfig: join(cwd, 'tsconfig.json'),
      tsconfigDefaults: {
        compilerOptions: {
          // Generate declaration files by default
          declaration: true,
        },
      },
      tsconfigOverride: {
        compilerOptions: {
          // Support dynamic import
          target: 'esnext',
        },
      },
    })] : []),
    babel({
      ...getBabelConfig({
        target,
        typescript: false,
      }),
      exclude: 'node_modules/**',
      babelrc: false,
      // ref: https://github.com/rollup/rollup-plugin-babel#usage
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'],
    }),
    json(),
  ];

  switch (type) {
    case 'esm':
      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${name}.esm.js`),
          },
          plugins,
          external,
        },
      ];

    case 'cjs':
      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${name}.js`),
          },
          plugins,
          external,
        },
      ];

    case 'umd':
      // Add umd related plugins
      plugins.push(
        nodeResolve({
          jsnext: true,
        }),
        commonjs({
          // 不 join 下 cwd，非当前目录运行时会报错，比如 test 会过不了
          include: join(cwd, 'node_modules/**'),
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('development'),
        }),
      );

      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${name}.umd.js`),
          },
          plugins,
          external,
        },
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${name}.umd.min.js`),
          },
          plugins: [
            ...plugins,
            terser({
              compress: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true,
                warnings: false,
              },
            }),
          ],
          external,
        },
      ];

    default:
      throw new Error(`Unsupported type ${type}`);
  }
}
