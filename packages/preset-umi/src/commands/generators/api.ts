import { lodash } from '@umijs/utils';
import { join, parse } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { GeneratorHelper, trim } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:api',
  });

  api.registerGenerator({
    key: 'api',
    name: 'Generator api',
    async fn(opts) {
      const h = new GeneratorHelper(api);

      let [_, ...apiNames] = opts.args._;

      if (apiNames.length === 0) {
        let apiName = await h.ensureVariableWithQuestion(null, {
          type: 'text',
          message: 'please input your api name:',
          initial: 'foo',
          format: trim,
        });

        apiNames = [apiName];
      }

      for (const apiName of apiNames) {
        const apiFileName = `${apiName}.ts`;
        const base = join(api.paths.absSrcPath, 'api');

        const target = join(base, apiFileName);

        const kv = generateApiResKV(apiName);

        await opts.generateFile({
          target,
          path: API_TML,
          baseDir: api.paths.absSrcPath,
          data: kv,
        });
      }
    },
  });
};

const API_TML = join(TEMPLATES_DIR, 'generate/api.ts.tpl');

export function generateApiResKV(apiName: string): {
  key: string;
  value: string;
} {
  const { name, dir } = parse(apiName);
  const match = name.match(/^\[\s*(\w+)\s*\]$/);

  const quoteStr = JSON.stringify;

  if (!match) {
    return { key: quoteStr(name), value: quoteStr('is working') };
  }

  const paramName = match[1];

  const { name: itemName } = parse(dir);

  const key = itemName
    ? `${itemName}${lodash.capitalize(paramName)}`
    : paramName;

  return { key: quoteStr(key), value: `req.params[${quoteStr(paramName)}]` };
}
