import { Config, transform, transformSync } from '@swc/core';
import type { LoaderContext } from '../../compiled/webpack';
import { Env, SwcOptions } from '../types';

function getBaseOpts(filename: string) {
  const isTSFile = filename.endsWith('.ts');
  const isTypeScript = isTSFile || filename.endsWith('.tsx');
  const swcOpts: Config = {
    jsc: {
      parser: {
        syntax: isTypeScript ? 'typescript' : 'ecmascript',
        [isTypeScript ? 'tsx' : 'jsx']: !isTSFile,
        dynamicImport: isTypeScript,
      },
      target: 'es2017',
      transform: {
        react: {
          runtime: 'automatic',
          pragma: 'React.createElement',
          pragmaFrag: 'React.Fragment',
          throwIfNamespace: true,
          development: process.env.NODE_ENV === Env.development,
          useBuiltins: true,
        },
      },
    },
    sourceMaps: true,
  };
  return swcOpts;
}

function swcLoader(this: LoaderContext<SwcOptions>, contents: string) {
  // 启用异步模式
  const callback = this.async();
  const loaderOpts = this.getOptions();

  const swcOpts = {
    ...getBaseOpts(this.resourcePath),
    ...loaderOpts,
  };

  const { sync = false, parseMap = false } = swcOpts;

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
