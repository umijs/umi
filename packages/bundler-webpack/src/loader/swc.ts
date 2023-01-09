import { Config, transform, transformSync } from '@swc/core';
import type { LoaderContext } from '../../compiled/webpack';
import { Env, type SwcOptions } from '../types';
import { deepmerge } from '@umijs/utils';

function getBaseOpts({ filename }: { filename: string }) {
  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const isDev = process.env.NODE_ENV === Env.development;

  /**
   * Not use swc auto polyfill , depend on `preset-umi/features/polyfill/polyfill` imported polyfill file
   *
   * @issue https://github.com/swc-project/swc/issues/2607
   *        https://github.com/swc-project/swc/issues/1604
   */
  const swcOpts: Config = {
    module: {
      // @ts-ignore
      type: 'es6',
      ignoreDynamic: true,
    },
    jsc: {
      parser: {
        syntax: isTypeScript ? 'typescript' : 'ecmascript',
        [isTypeScript ? 'tsx' : 'jsx']: !isTSFile,
        dynamicImport: isTypeScript,
      },
      target: 'es2015',
      transform: {
        react: {
          runtime: 'automatic',
          pragma: 'React.createElement',
          pragmaFrag: 'React.Fragment',
          throwIfNamespace: true,
          development: isDev,
          useBuiltins: true,
        },
      },
    },
  };
  return swcOpts;
}

function swcLoader(
  this: LoaderContext<SwcOptions>,
  contents: string,
  inputSourceMap: string | Record<string, any>,
) {
  const callback = this.async();
  const loaderOpts = this.getOptions();

  // ensure `inputSourceMap` is string
  if (inputSourceMap && typeof inputSourceMap === 'object') {
    inputSourceMap = JSON.stringify(inputSourceMap);
  }

  const {
    sync = false,
    parseMap = false,
    excludeFiles = [],
    enableAutoCssModulesPlugin = false,
    mergeConfigs,
    ...otherOpts
  } = loaderOpts;
  const filename = this.resourcePath;

  // skip some files for MFSU
  const isSkip = excludeFiles.some((pattern) => {
    if (typeof pattern === 'string') {
      return filename == pattern;
    }
    return pattern.test(filename);
  });
  if (isSkip) {
    return callback(
      null,
      contents,
      parseMap ? JSON.parse(inputSourceMap) : inputSourceMap,
    );
  }

  let swcOpts: SwcOptions = {
    ...getBaseOpts({
      filename,
    }),
    // filename
    filename,
    sourceFileName: filename,
    // source map
    sourceMaps: this.sourceMap,
    ...(inputSourceMap
      ? {
          inputSourceMap,
        }
      : {}),
    ...otherOpts,
  };

  if (enableAutoCssModulesPlugin) {
    swcOpts = deepmerge(swcOpts, {
      jsc: {
        experimental: {
          plugins: [[require.resolve('swc-plugin-auto-css-modules'), {}]],
        },
      },
    } satisfies SwcOptions);
  }

  if (mergeConfigs) {
    swcOpts = deepmerge(swcOpts, mergeConfigs);
  }

  try {
    if (sync) {
      const output = transformSync(contents, swcOpts);
      callback(
        null,
        output.code,
        parseMap ? JSON.parse(output.map!) : output.map,
      );
    } else {
      transform(contents, swcOpts).then(
        (output) => {
          callback(
            null,
            output.code,
            parseMap ? JSON.parse(output.map!) : output.map,
          );
        },
        (err) => {
          callback(err);
        },
      );
    }
  } catch (e: any) {
    callback(e);
  }
}

export default swcLoader;
