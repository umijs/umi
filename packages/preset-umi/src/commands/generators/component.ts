import { GeneratorType } from '@umijs/core';
import { lodash } from '@umijs/utils';
import { join, parse } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import {
  ETempDir,
  GeneratorHelper,
  type IArgsComponent,
  processGenerateFiles,
  tryEject,
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

    const indexFile = join(base, 'index.ts');
    const compFile = join(base, `${capitalizeName}.tsx`);

    await processGenerateFiles({
      filesMap: [
        {
          from: join(appRoot, USER_TEMPLATE_COMP_DIR, 'index'),
          fromFallback: INDEX_TPL,
          to: indexFile,
          exts: ['.ts.tpl', '.ts', 'tsx.tpl', 'tsx'],
        },
        {
          from: join(appRoot, USER_TEMPLATE_COMP_DIR, 'component'),
          fromFallback: COMP_TPL,
          to: compFile,
          exts: ['.tsx.tpl', '.tsx'],
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

const INDEX_TPL = join(TEMPLATES_DIR, 'generate/component/index.ts.tpl');
const COMP_TPL = join(TEMPLATES_DIR, 'generate/component/component.tsx.tpl');
const USER_TEMPLATE_COMP_DIR = 'templates/component';
