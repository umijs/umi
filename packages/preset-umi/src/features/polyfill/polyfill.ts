import { dirname } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'polyfill',
    config: {
      schema(Joi) {
        return Joi.object().keys({
          imports: Joi.array().items(Joi.string()).required().unique(),
        });
      },
    },
    enableBy: () => {
      return process.env.BABEL_POLYFILL !== 'none';
    },
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'core/polyfill.ts',
      noPluginDir: true,
      tpl: `
{{#imports}}
import '{{{ . }}}';
{{/imports}}
{{^imports}}
import 'core-js';
{{/imports}}
import 'regenerator-runtime/runtime';
export {};
      `,
      context: {
        imports: api.config.polyfill?.imports || [],
      },
    });
  });

  api.addPolyfillImports(() => [{ source: `./core/polyfill` }]);

  api.modifyConfig((memo) => {
    memo.alias['core-js'] = dirname(require.resolve('core-js/package'));
    memo.alias['regenerator-runtime'] = dirname(
      require.resolve('regenerator-runtime/package'),
    );
    return memo;
  });
};
