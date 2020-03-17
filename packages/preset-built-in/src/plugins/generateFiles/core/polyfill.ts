import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'polyfill',
    config: {
      schema(joi) {
        return joi.alternatives().try(
          joi.string().valid('es', 'stable'),
          joi.object().keys({
            imports: joi
              .array()
              .items(joi.string())
              .required()
              .unique(),
          }),
        );
      },
    },
    enableBy: () => {
      return process.env.BABEL_POLYFILL !== 'none';
    },
  });

  api.addPolyfillImports(() => [{ source: './core/polyfill' }]);

  api.onGenerateFiles(() => {
    const coreJs = api.config.polyfill;

    api.writeTmpFile({
      content: api.utils.Mustache.render(
        readFileSync(join(__dirname, 'polyfill.tpl'), 'utf-8'),
        typeof coreJs === 'string'
          ? {
              coreJs: `core-js${coreJs ? `/${coreJs}` : ''}`,
            }
          : {
              imports: coreJs && coreJs.imports ? coreJs.imports : [],
            },
      ),
      path: 'core/polyfill.ts',
    });
  });

  api.chainWebpack(memo => {
    memo.resolve.alias.set(
      'regenerator-runtime',
      dirname(require.resolve('regenerator-runtime/package')),
    );
    return memo;
  });
};
