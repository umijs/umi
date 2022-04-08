import { GeneratorType } from '@umijs/core';
import { join } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { GeneratorHelper, trim } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:mock',
  });

  api.registerGenerator({
    key: 'mock',
    type: GeneratorType.generate,
    name: 'Generate mock code snippet',

    fn: async (opts) => {
      let [_, mockName] = opts.args._;

      const h = new GeneratorHelper(api);

      mockName = await h.ensureVariableWithQuestion(mockName, {
        type: 'text',
        message: 'please input your mock file name',
        initial: 'mockName',
        format: trim,
      });

      opts.generateFile({
        target: join(api.paths.cwd, 'mock', `${mockName}.ts`),
        baseDir: api.paths.cwd,
        path: join(TEMPLATES_DIR, 'generate/mock.ts.tpl'),
        data: { mockName },
      });
    },
  });
};
