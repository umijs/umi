import { Compilation, Compiler } from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { InnerCallback } from 'tapable';
import { DeadCodeParams, Env, IConfig } from '../types';
import detectDeadcode, { disabledFolders, Options } from './detectDeadCode';

interface IOpts {
  userConfig: IConfig;
  config: Config;
  env: Env;
}

const defaultOptions: Options = {
  patterns: [`!(${disabledFolders.join('|')})/**/*.*`],
  exclude: [],
  failOnHint: false,
  detectUnusedFiles: true,
  detectUnusedExport: true,
};

class DetectDeadCodePlugin {
  options: Options = defaultOptions;

  constructor(options: DeadCodeParams) {
    if (!options) {
      return;
    }

    this.options = {
      ...this.options,
      ...options,
    };
  }

  apply(compiler: Compiler) {
    if (!this.options.context) {
      this.options = {
        ...this.options,
        context: compiler.context,
      };
    }

    compiler.hooks.afterEmit.tapAsync(
      'DetectDeadCodePlugin',
      this.handleAfterEmit,
    );
  }

  handleAfterEmit = (
    compilation: Compilation,
    callback: InnerCallback<Error, any>,
  ) => {
    detectDeadcode(compilation, this.options);
    callback();
  };
}

export async function addDetectDeadCodePlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  const isDev = opts.env === Env.development;

  if (userConfig.deadCode && !isDev) {
    config
      .plugin('detect-dead-code-plugin')
      .use(DetectDeadCodePlugin, [userConfig.deadCode]);
  }
}
