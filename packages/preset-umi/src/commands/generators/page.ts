import { GeneratorType } from '@umijs/core';
import { prompts, randomColor } from '@umijs/utils';
import { join, parse } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import {
  ETempDir,
  IFile,
  processGenerateFiles,
  promptsExitWhenCancel,
  tryEject,
  type IArgsPage,
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
      if (args.eject) {
        await tryEject(ETempDir.Page, api.paths.cwd);
        return;
      }
      return new PageGenerator({
        args,
        absPagesPath: api.paths.absPagesPath,
        appCwd: api.paths.cwd,
        importSource: api.appData.umi.importSource,
        useStyledComponents: !!api.userConfig.styledComponents,
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
  private importSource = '';
  private needEnsureDirMode = false;
  private prompts = promptsExitWhenCancel;
  private paths: string[] = [];

  constructor(
    readonly options: {
      args: IArgsPage;
      absPagesPath: string;
      appCwd: string;
      importSource?: string;
      useStyledComponents?: boolean;
    },
  ) {
    this.isDirMode = !!options.args.dir;
    this.importSource = options.importSource || 'umi';
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
    const { absPagesPath, args, appCwd, useStyledComponents } = this.options;
    const { _, dir: _dir, eject: _eject, fallback, ...restVars } = args;

    const filesMap: IFile[] = [
      {
        from: join(appCwd, USER_TEMPLATE_PAGE_DIR, 'index'),
        fromFallback: join(
          PAGE_TEMPLATE_DIR,
          useStyledComponents
            ? 'index.styled-components.tsx.tpl'
            : 'index.tsx.tpl',
        ),
        to: join(absPagesPath, this.dir, `${this.name}.tsx`),
        exts: ['.tsx.tpl', '.tsx'],
      },
    ];

    // 如果项目开启了 styled-components 功能，则不再生成 less 文件
    if (!useStyledComponents) {
      filesMap.push({
        from: join(appCwd, USER_TEMPLATE_PAGE_DIR, 'index'),
        fromFallback: join(PAGE_TEMPLATE_DIR, 'index.less.tpl'),
        to: join(absPagesPath, this.dir, `${this.name}.less`),
        exts: ['.less.tpl', '.less'],
      });
    }
    await processGenerateFiles({
      filesMap,
      baseDir: this.options.appCwd,
      presetArgs: {
        fallback,
      },
      templateVars: {
        color: randomColor(),
        name: this.name,
        cssExt: '.less',
        importSource: this.importSource,
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
        importSource: this.importSource,
        color: randomColor(),
        name: 'index',
        cssExt: '.less',
        ...restVars,
      },
    });
  }
}
