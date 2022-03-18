import { GeneratorType } from '@umijs/core';
import { generateFile, prompts, randomColor } from '@umijs/utils';
import { join, parse } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'generator:page',
  });

  api.registerGenerator({
    key: 'page',
    name: 'Create Pages',
    description: 'Create a umi page by page name',
    type: GeneratorType.generate,
    fn: async (options) => {
      return new PageGenerator({
        generateFile: options.generateFile,
        args: options.args,
        absPagesPath: api.paths.absPagesPath,
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
  private needEnsureDirMode = false;
  private prompts = prompts;

  constructor(
    readonly options: {
      args: any;
      generateFile: typeof generateFile;
      absPagesPath: string;
    },
  ) {
    this.isDirMode = options.args.dir;
    const [_, nameOrPath = ''] = options.args._;
    if (nameOrPath) {
      this.setPath(nameOrPath);
    } else {
      this.needEnsureDirMode = true;
    }
  }

  async run() {
    await this.ensureName();
    await this.ensureDirMode();

    if (this.isDirMode) {
      await this.dirModeRun();
    } else {
      await this.fileModeRun();
    }
  }

  setPrompter(p: typeof prompts) {
    this.prompts = p;
  }

  getDirMode() {
    return this.isDirMode;
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

    const response = await this.prompts({
      type: 'text',
      name: 'name',
      message: 'What is the name of page?',
    });
    if (response.name) {
      this.setPath(response.name);
    } else {
      this.setPath('index');
    }
    this.isDirMode = false;
  }

  private async ensureDirMode() {
    if (!this.needEnsureDirMode) return;

    const response = await this.prompts({
      type: 'select',
      name: 'mode',
      message: 'How dou you want page files to be created?',
      choices: [
        { title: this.dirModeFileExample(), value: 'dir' },
        { title: this.fileModeFileExample(), value: 'file' },
      ],
      initial: 0,
    });

    this.isDirMode = response.mode === 'dir';
  }

  private fileModeFileExample() {
    const base = join(this.dir, this.name);
    return `${base}.{tsx,less}`;
  }

  private dirModeFileExample() {
    const base = join(this.dir, this.name, 'index');
    return `${base}.{tsx,less}`;
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
      baseDir: absPagesPath,
      data,
    });

    await generateFile({
      path: LEES_TPL_PATH,
      target: join(absPagesPath, this.dir, `${this.name}.less`),
      baseDir: absPagesPath,
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
