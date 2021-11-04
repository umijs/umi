import { GeneratorType } from '@umijs/core';
import { prompts, randomColor } from '@umijs/utils';
import { join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'page',
    name: 'Create Pages',
    description: 'Create a umi page by page name',
    type: GeneratorType.generate,
    fn: async (options) => {
      const { args, api, generateFile } = options;
      const [_, _name] = args._;
      let name = _name;
      if (!name) {
        const response = await prompts({
          type: 'text',
          name: 'name',
          message: 'What is the name of page?',
        });
        name = response.name;
      }
      generateFile({
        path: join(__dirname, '../../../templates/generate/page'),
        target: join(api.paths.absPagesPath, name),
        data: {
          color: randomColor(),
          name,
          cssExt: '.less',
        },
      });
    },
  });
};
