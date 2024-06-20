import { Compiler, EntryPlugin } from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';

interface IOpts {
  config: Config;
}

class AdditionEntryPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.environment.tap('AdditionEntryPlugin', () => {
      const additionalEntries = [];
      additionalEntries.push(require.resolve('../../client/client/client'));
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
  config.plugin('add-addtion-entry-plugin').use(AdditionEntryPlugin);
}
