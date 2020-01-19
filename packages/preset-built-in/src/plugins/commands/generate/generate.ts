import { IApi } from '@umijs/types';
import createPageGenerator from './PageGenerator/createPageGenerator';

interface IRegisterGenerator {
  key: string;
  Generator: any;
}

export default (api: IApi) => {
  const {
    paths,
    utils: { chalk, Generator },
  } = api;

  const generators = {
    page: createPageGenerator({ api }),
  };

  api.registerCommand({
    name: 'generate',
    alias: 'g',
    async fn({ args }) {
      const [type, ..._] = args._;
      const Generator = generators[type];
      if (!Generator) {
        console.error(chalk.red(`Generator ${type} not found.`));
        return;
      }

      const generator = new Generator({
        cwd: api.cwd,
        args: {
          ...args,
          _,
        },
      });
      generator.run();
    },
  });

  api.registerMethod({
    name: 'registerGenerator',
    fn: ({ key, Generator }: IRegisterGenerator) => {
      generators[key] = Generator;
    },
  });
};
