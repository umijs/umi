import { GeneratorType } from '@umijs/core';
import { prompts, randomColor } from '@umijs/utils';
import { join, parse } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'page',
    name: 'Create Pages',
    description: 'Create a umi page by page name',
    type: GeneratorType.generate,
    fn: async (options) => {
      return new PageGenerator({
        generateFile: options.generateFile,
        args: options.args,
        absPagesPath: options.api.paths.absPagesPath,
      }).run();
    },
  });
};

const INDEX_TPL_PATH = join(
  __dirname,
  '../../../templates/generate/page/index.tsx.tpl',
);
const LEES_TPL_PATH = join(
  __dirname,
  '../../../templates/generate/page/index.less.tpl',
);

export class PageGenerator {
  private isDirMode = false;
  private dir = '';
  private name = '';

  constructor(
    readonly options: {
      args: any;
      generateFile: {
        (opts: {
          path: string;
          target: string;
          data?: any;
          questions?: prompts.PromptObject[];
        }): Promise<void>;
      };
      absPagesPath: string;
    },
  ) {
    this.isDirMode = options.args.dir;
    const [_, nameOrPath = ''] = options.args._;
    if (nameOrPath) {
      this.setPath(nameOrPath);
    }
  }

  async run() {
    await this.ensureName();

    if (this.isDirMode) {
      await this.dirModeRun();
    } else {
      await this.fileModeRun();
    }
  }

  private setPath(np: string) {
    const { dir, name } = parse(np);
    this.name = name;
    this.dir = dir;
  }

  private async ensureName() {
    if (this.name) {
      return;
    }

    const response = await prompts({
      type: 'text',
      name: 'name',
      message: 'What is the name of page?',
    });
    if (!response.name) {
      this.name = response.name || 'index';
      this.isDirMode = false;
    }
  }

  private async fileModeRun() {
    const { generateFile, absPagesPath } = this.options;

    const data = {
      color: randomColor(),
      name: this.name,
      cssExt: '.less',
    };

    await generateFile({
      path: INDEX_TPL_PATH,
      target: join(absPagesPath, this.dir, `${this.name}.tsx`),
      data,
    });

    await generateFile({
      path: LEES_TPL_PATH,
      target: join(absPagesPath, this.dir, `${this.name}.less`),
      data,
    });
  }

  private async dirModeRun() {
    const { generateFile, absPagesPath } = this.options;
    await generateFile({
      path: join(__dirname, '../../../templates/generate/page'),
      target: join(absPagesPath, this.dir, this.name),
      data: {
        color: randomColor(),
        name: 'index',
        cssExt: '.less',
      },
    });
  }
}
