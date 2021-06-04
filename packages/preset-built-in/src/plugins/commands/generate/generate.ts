import { IApi } from '@umijs/types';
import createHTMLGenerator from './HTMLGenerator/createHTMLGenerator';
import createPageGenerator from './PageGenerator/createPageGenerator';
import createTmpGenerator from './TmpGenerator/createTmpGenerator';

interface IRegisterGenerator {
  key: string;
  Generator: any;
}

export default (api: IApi) => {
  const {
    paths,
    utils: { chalk },
  } = api;

  const generators = {};

  api.registerCommand({
    name: 'generate',
    alias: 'g',
    description: 'generate code snippets quickly',
    async fn({ args }) {
      const [type, ..._] = args._;
      const Generator = generators[type];
      if (!Generator) {
        throw new Error(`Generator ${type} not found.`);
      }

      const generator = new Generator({
        cwd: api.cwd,
        args: {
          ...args,
          _,
        },
      });
      await generator.run();
    },
  });

  api.registerMethod({
    name: 'registerGenerator',
    fn: ({ key, Generator }: IRegisterGenerator) => {
      generators[key] = Generator;
    },
  });

  api.registerGenerator({
    key: 'page',
    // @ts-ignore
    Generator: createPageGenerator({ api }),
  });
  api.registerGenerator({
    key: 'tmp',
    // @ts-ignore
    Generator: createTmpGenerator({ api }),
  });
  api.registerGenerator({
    key: 'html',
    // @ts-ignore
    Generator: createHTMLGenerator({ api }),
  });
};
