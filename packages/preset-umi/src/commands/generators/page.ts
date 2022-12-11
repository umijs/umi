import { GeneratorType } from '@umijs/core';
import { prompts, randomColor } from '@umijs/utils';
import { join, parse } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import {
  ETempDir,
  IArgs,
  processGenerateFiles,
  promptsExitWhenCancel,
  tryEject,
} from './utils';

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
      const { args } = options;
      const {
        paths: { absPagesPath, cwd },
      } = api;
      const { eject } = args;

      if (eject) {
        await tryEject(ETempDir.Page, cwd);
        return;
      }

      return new PageGenerator({
        args,
        absPagesPath,
        appCwd: cwd,
      }).run();
    },
  });
};

const PAGE_TEMPLATE_DIR = join(TEMPLATES_DIR, 'generate/page/');
const DEFAULT_PAGE_NAME = 'unTitledPage';
const USER_TEMPLATE_PAGE_DIR = 'templates/page';

export class PageGenerator {
  private isDirMode = false;
  private dir = '';
  private name = '';
  private needEnsureDirMode = false;
  private prompts = promptsExitWhenCancel;
  private paths: string[] = [];

  constructor(
    readonly options: {
      args: IArgs;
      absPagesPath: string;
      appCwd: string;
    },
  ) {
    this.isDirMode = !!options.args.dir;
    const [_, ...inputPaths] = options.args._;

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
    const { absPagesPath, args, appCwd } = this.options;
    const { _, dir: _dir, eject: _eject, fallback, ...restVars } = args;

    await processGenerateFiles({
      filesMap: [
        {
          from: join(appCwd, USER_TEMPLATE_PAGE_DIR, 'index'),
          fromFallback: join(PAGE_TEMPLATE_DIR, 'index.tsx.tpl'),
          to: join(absPagesPath, this.dir, `${this.name}.tsx`),
          exts: ['.tsx.tpl', '.tsx'],
        },
        {
          from: join(appCwd, USER_TEMPLATE_PAGE_DIR, 'index'),
          fromFallback: join(PAGE_TEMPLATE_DIR, 'index.less.tpl'),
          to: join(absPagesPath, this.dir, `${this.name}.less`),
          exts: ['.less.tpl', '.less'],
        },
      ],
      baseDir: this.options.appCwd,
      presetArgs: {
        fallback,
      },
      templateVars: {
        color: randomColor(),
        name: this.name,
        cssExt: '.less',
        ...restVars,
      },
    });
  }

  private async dirModeRun() {
    const { absPagesPath, args, appCwd } = this.options;
    const { _, dir: _dir, eject: _eject, fallback, ...restVars } = args;

    await processGenerateFiles({
      filesMap: [
        {
          from: join(appCwd, USER_TEMPLATE_PAGE_DIR),
          fromFallback: PAGE_TEMPLATE_DIR,
          to: join(absPagesPath, this.dir, this.name),
        },
      ],
      baseDir: appCwd,
      presetArgs: {
        fallback,
      },
      templateVars: {
        color: randomColor(),
        name: 'index',
        cssExt: '.less',
        ...restVars,
      },
    });
  }
}
