import { GeneratorType } from '@umijs/core';
import { generateFile, prompts, randomColor } from '@umijs/utils';
import { join, parse } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { promptsExitWhenCancel } from './utils';

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
        appCwd: api.paths.cwd,
      }).run();
    },
  });
};

const INDEX_TPL_PATH = join(TEMPLATES_DIR, 'generate/page/index.tsx.tpl');
const LEES_TPL_PATH = join(TEMPLATES_DIR, 'generate/page/index.less.tpl');
const DEFAULT_PAGE_NAME = 'unTitledPage';

export class PageGenerator {
  private isDirMode = false;
  private dir = '';
  private name = '';
  private needEnsureDirMode = false;
  private prompts = promptsExitWhenCancel;
  private paths: string[] = [];

  constructor(
    readonly options: {
      args: any;
      generateFile: typeof generateFile;
      absPagesPath: string;
      appCwd: string;
    },
  ) {
    this.isDirMode = options.args.dir;
    const [_, ...inputPaths] = options.args._ as string[];

    if (inputPaths.length > 0) {
      this.paths = inputPaths;
    } else {
      this.needEnsureDirMode = true;
    }
  }

  async run() {
    if (this.paths.length === 0) {
      await this.runInteractiveMode();
    } else {
      for (const p of this.paths) {
        this.setPath(p);
        if (this.isDirMode) {
          await this.dirModeRun();
        } else {
          await this.fileModeRun();
        }
      }
    }
  }

  async runInteractiveMode() {
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
      initial: DEFAULT_PAGE_NAME,
    });

    const { name: rawInput = '' } = response;

    const pageName = rawInput.trim();

    if (pageName) {
      this.setPath(pageName);
    } else {
      this.setPath(DEFAULT_PAGE_NAME);
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
      baseDir: this.options.appCwd,
      data,
    });

    await generateFile({
      path: LEES_TPL_PATH,
      target: join(absPagesPath, this.dir, `${this.name}.less`),
      baseDir: this.options.appCwd,
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
      baseDir: this.options.appCwd,
    });
  }
}
