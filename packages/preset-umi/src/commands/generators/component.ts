import { GeneratorType } from '@umijs/core';
import { lodash } from '@umijs/utils';
import { join, parse } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import {
  ETempDir,
  GeneratorHelper,
  processGenerateFiles,
  tryEject,
  type IArgsComponent,
} from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:component',
  });

  api.registerGenerator({
    key: 'component',
    name: 'Generate Component',
    description: 'Generate component boilerplate code',
    type: GeneratorType.generate,

    fn: async (options) => {
      const { args } = options;

      if (args.eject) {
        await tryEject(ETempDir.Component, api.paths.cwd);
        return;
      }

      const h = new GeneratorHelper(api);
      let componentNames = args._.slice(1);

      if (componentNames.length === 0) {
        let name: string = '';
        name = await h.ensureVariableWithQuestion(name, {
          type: 'text',
          message: 'Please input you component Name',
          hint: 'foo',
          initial: 'foo',
          format: (s) => s?.trim() || '',
        });
        componentNames = [name];
      }

      for (const cn of componentNames) {
        await new ComponentGenerator({
          srcPath: api.paths.absSrcPath,
          appRoot: api.paths.cwd,
          componentName: cn,
          args,
        }).run();
      }
    },
  });
};

export class ComponentGenerator {
  private readonly name: string;
  private readonly dir: string;

  constructor(
    readonly opts: {
      componentName: string;
      srcPath: string;
      appRoot: string;
      args: IArgsComponent;
    },
  ) {
    const { name, dir } = parse(this.opts.componentName);
    this.name = name;
    this.dir = dir;
  }

  async run() {
    const { appRoot, args } = this.opts;
    const capitalizeName = lodash.upperFirst(this.name);
    const base = join(
      this.opts.srcPath,
      'components',
      this.dir,
      capitalizeName,
    );
    const { _, eject: _eject, fallback, ...restArgs } = args;

    await processGenerateFiles({
      filesMap: [
        {
          from: join(appRoot, USER_TEMPLATE_COMP_DIR),
          fromFallback: COMP_TEMPLATE_DIR,
          to: base,
        },
      ],
      baseDir: appRoot,
      presetArgs: {
        fallback,
      },
      templateVars: {
        compName: capitalizeName,
        ...restArgs,
      },
    });
  }
}

const COMP_TEMPLATE_DIR = join(TEMPLATES_DIR, 'generate/component');
const USER_TEMPLATE_COMP_DIR = 'templates/component';
