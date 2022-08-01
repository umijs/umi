import { Compiler, EntryPlugin } from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  userConfig: IConfig;
  config: Config;
  env: Env;
}

interface AdditionEntryPluginOptions {
  context?: string;
}

class AdditionEntryPlugin {
  options: AdditionEntryPluginOptions = {};

  constructor(options: {}) {
    if (!options) {
      return;
    }
  }

  apply(compiler: Compiler) {
    if (!this.options.context) {
      this.options = {
        ...this.options,
        context: compiler.context,
      };
    }

    compiler.hooks.environment.tap('AdditionEntryPlugin', () => {
      const additionalEntries = [];
      additionalEntries.push(
        `${require.resolve('../../client/client/client')}`,
      );
      if (typeof EntryPlugin !== 'undefined') {
        for (const additionalEntry of additionalEntries) {
          new EntryPlugin(compiler.context, additionalEntry, {
            // eslint-disable-next-line no-undefined
            name: undefined,
          }).apply(compiler);
        }
      }
    });
  }
}

export async function addAdditionEntryPlugin(opts: IOpts) {
  const { config } = opts;
  const isDev = opts.env === Env.development;

  if (isDev) {
    config.plugin('add-addtion-entry-plugin').use(AdditionEntryPlugin);
  }
}
