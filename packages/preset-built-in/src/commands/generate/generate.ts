import { BaseGenerator, randomColor } from '@umijs/utils';
import { join } from 'path';
import { IApi, IRegisterGenerator } from '../../types';

export default (api: IApi) => {
  const generators = {} as any;
  api.registerCommand({
    name: 'generate',
    alias: 'g',
    details: `
umi g page pageName
`,
    description: 'generate code snippets quickly',
    async fn({ args }) {
      const [type] = args._;
      const Generator = generators[type];
      if (!Generator) {
        throw new Error(`Generator ${type} not found.`);
      }
      await Generator({
        paths: api.paths,
        args,
      });
    },
  });

  api.registerMethod({
    name: 'registerGenerator',
    fn: ({ key, fn }: IRegisterGenerator) => {
      generators[key] = fn;
    },
  });

  api.registerGenerator({
    key: 'page',
    fn: async (options) => {
      const { args, paths } = options;
      const [_, name] = args._;
      await new BaseGenerator({
        path: join(__dirname, '../../../templates/generate/page'),
        target: paths.absPagesPath,
        data: {
          color: randomColor(),
          name,
          cssExt: '.less',
        },
      }).run();
    },
  });
};
