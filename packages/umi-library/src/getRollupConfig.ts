import { basename, extname, join } from 'path';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss-umi';
import { ModuleFormat, RollupOptions } from 'rollup';
import tempDir from 'temp-dir';
import autoprefixer from 'autoprefixer';
import NpmImport from 'less-plugin-npm-import';
import getBabelConfig from './getBabelConfig';
import { IBundleOptions } from './types';

interface IGetRollupConfigOpts {
  cwd: string;
  entry: string;
  type: ModuleFormat;
  bundleOpts: IBundleOptions;
}

interface IPkg {
  dependencies?: Object;
  peerDependencies?: Object;
}

export default function(opts: IGetRollupConfigOpts): RollupOptions[] {
  const { type, entry, cwd, bundleOpts } = opts;
  const {
    umd,
    esm,
    cjs,
    file,
    target = 'browser',
    cssModules: modules,
    extraPostCSSPlugins = [],
    extraBabelPresets = [],
    extraBabelPlugins = [],
    autoprefixer: autoprefixerOpts,
    namedExports,
    runtimeHelpers: runtimeHelpersOpts,
  } = bundleOpts;
  const entryExt = extname(entry);
  const name = file || basename(entry, entryExt);
  const isTypeScript = entryExt === '.ts' || entryExt === '.tsx';

  let pkg = {} as IPkg;
  try {
    pkg = require(join(cwd, 'package.json')); // eslint-disable-line
  } catch (e) {}

  // cjs 不给浏览器用，所以无需 runtimeHelpers
  const runtimeHelpers = type === 'cjs' ? false : runtimeHelpersOpts;
  const babelOpts = {
    ...getBabelConfig({
      target,
      typescript: false,
      runtimeHelpers,
    }),
    runtimeHelpers,
    exclude: 'node_modules/**',
    babelrc: false,
    // ref: https://github.com/rollup/rollup-plugin-babel#usage
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs'],
  };
  babelOpts.presets.push(...extraBabelPresets);
  babelOpts.plugins.push(...extraBabelPlugins);

  // rollup configs
  const input = join(cwd, entry);
  const format = type;

  // ref: https://rollupjs.org/guide/en#external
  // 潜在问题：引用包的子文件时会报 warning，比如 @babel/runtime/helpers/esm/createClass
  // 解决方案：可以用 function 处理
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ];
  // umd 只要 external peerDependencies
  const externalPeerDeps = Object.keys(pkg.peerDependencies || {});

  const terserOpts = {
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
    },
  };
  const plugins = [
    postcss({
      modules,
      use: [
        [
          'less',
          {
            plugins: [new NpmImport({ prefix: '~' })],
            javascriptEnabled: true,
          },
        ],
      ],
      plugins: [autoprefixer(autoprefixerOpts), ...extraPostCSSPlugins],
    }),
    ...(isTypeScript
      ? [
          typescript({
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
          }),
        ]
      : []),
    babel(babelOpts),
    json(),
  ];

  switch (type) {
    case 'esm':
      return [
        {
          input,
          output: {
            format,
            file: join(
              cwd,
              `dist/${(esm && (esm as any).file) || `${name}.esm`}.js`,
            ),
          },
          plugins,
          external,
        },
        ...(esm && (esm as any).mjs
          ? [
              {
                input,
                output: {
                  format,
                  file: join(
                    cwd,
                    `dist/${(esm && (esm as any).file) || `${name}`}.mjs`,
                  ),
                },
                plugins: [
                  ...plugins,
                  nodeResolve({
                    jsnext: true,
                  }),
                  replace({
                    'process.env.NODE_ENV': JSON.stringify('production'),
                  }),
                  terser(terserOpts),
                ],
                external: externalPeerDeps,
              },
            ]
          : []),
      ];

    case 'cjs':
      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${(cjs && (cjs as any).file) || name}.js`),
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
          include: /node_modules/,
          namedExports,
        }),
      );

      return [
        {
          input,
          output: {
            format,
            file: join(cwd, `dist/${(umd && umd.file) || `${name}.umd`}.js`),
            globals: umd && umd.globals,
            name: umd && umd.name,
          },
          plugins: [
            ...plugins,
            replace({
              'process.env.NODE_ENV': JSON.stringify('development'),
            }),
          ],
          external: externalPeerDeps,
        },
        ...(umd && umd.minFile === false
          ? []
          : [
              {
                input,
                output: {
                  format,
                  file: join(
                    cwd,
                    `dist/${(umd && umd.file) || `${name}.umd`}.min.js`,
                  ),
                  globals: umd && umd.globals,
                  name: umd && umd.name,
                },
                plugins: [
                  ...plugins,
                  replace({
                    'process.env.NODE_ENV': JSON.stringify('production'),
                  }),
                  terser(terserOpts),
                ],
                external: externalPeerDeps,
              },
            ]),
      ];

    default:
      throw new Error(`Unsupported type ${type}`);
  }
}
