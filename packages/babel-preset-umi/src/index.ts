// @ts-ignore
import { mergeConfig } from '@umijs/utils';
import { dirname } from 'path';

interface IImportPluginOpts {
  libraryName: string;
  libraryDirectory?: string;
  style?: boolean;
  camel2DashComponentName?: boolean;
}

export interface IOpts {
  typescript?: boolean;
  react?: object;
  debug?: boolean;
  env?: object;
  transformRuntime?: object;
  reactRemovePropTypes?: boolean;
  reactRequire?: boolean;
  dynamicImportNode?: boolean;
  autoCSSModules?: boolean;
  svgr?: object;
  import?: IImportPluginOpts[];
}

function toObject<T extends object>(obj: T | boolean): T | Partial<T> {
  return typeof obj === 'object' ? obj : {};
}

export default (context: any, opts: IOpts = {}) => {
  const defaultEnvConfig = {
    exclude: [
      'transform-typeof-symbol',
      'transform-unicode-regex',
      'transform-sticky-regex',
      'transform-new-target',
      'transform-modules-umd',
      'transform-modules-systemjs',
      'transform-modules-amd',
      'transform-literals',
    ],
  };

  return {
    presets: [
      opts.env && [
        require('@babel/preset-env').default,
        {
          ...mergeConfig(defaultEnvConfig, toObject(opts.env)),
          debug: opts.debug,
        },
      ],
      opts.react && [
        require('@babel/preset-react').default,
        toObject(opts.react),
      ],
      opts.typescript && [
        require('@babel/preset-typescript').default,
        {
          // https://babeljs.io/docs/en/babel-plugin-transform-typescript#impartial-namespace-support
          allowNamespaces: true,
        },
      ],
    ].filter(Boolean),
    plugins: [
      // Necessary to include regardless of the environment because
      // in practice some other transforms (such as object-rest-spread)
      // don't work without it: https://github.com/babel/babel/issues/7215
      [
        require('@babel/plugin-transform-destructuring').default,
        { loose: false },
      ],
      [require('@babel/plugin-proposal-decorators').default, { legacy: true }],
      [
        require('@babel/plugin-proposal-class-properties').default,
        { loose: true },
      ],
      require('@babel/plugin-proposal-export-default-from').default,
      [
        require('@babel/plugin-proposal-pipeline-operator').default,
        {
          proposal: 'minimal',
        },
      ],
      require('@babel/plugin-proposal-do-expressions').default,
      require('@babel/plugin-proposal-function-bind').default,
      opts.transformRuntime && [
        require('@babel/plugin-transform-runtime').default,
        {
          version: require('@babel/runtime/package.json').version,
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#absoluteruntime
          // lock the version of @babel/runtime
          // make sure we are using the correct version
          absoluteRuntime: dirname(
            require.resolve('@babel/runtime/package.json'),
          ),
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
          useESModules: true,
          ...toObject(opts.transformRuntime),
        },
      ],
      opts.reactRemovePropTypes && [
        require.resolve('babel-plugin-transform-react-remove-prop-types'),
        {
          removeImport: true,
        },
      ],
      opts.reactRequire && [require.resolve('babel-plugin-react-require')],
      opts.dynamicImportNode && [
        require.resolve('babel-plugin-dynamic-import-node'),
      ],
      opts.autoCSSModules && [
        require.resolve('@umijs/babel-plugin-auto-css-modules'),
      ],
      opts.svgr && [
        require.resolve('babel-plugin-named-asset-import'),
        {
          loaderMap: {
            svg: {
              ReactComponent: `${require.resolve(
                '@svgr/webpack',
              )}?-svgo,+titleProp,+ref![path]`,
            },
          },
        },
      ],
      ...(opts.import
        ? opts.import.map(importOpts => {
            return [
              require.resolve('babel-plugin-import'),
              importOpts,
              importOpts.libraryName,
            ];
          })
        : []),
    ].filter(Boolean),
  };
};
