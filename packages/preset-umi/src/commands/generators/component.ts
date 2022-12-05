import { GeneratorType } from '@umijs/core';
import { generateFile, lodash } from '@umijs/utils';
import { join, parse } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { GeneratorHelper, IArgs, processGenerateFile, tryEject } from './utils';

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
      if (options.args.eject) {
        tryEject('component', api.paths.cwd);
        return;
      }

      const h = new GeneratorHelper(api);
      let componentNames = options.args._.slice(1);

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
          generateFile: options.generateFile,
          componentName: cn,
          args: api.args,
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
      generateFile: typeof generateFile;
      args: IArgs;
    },
  ) {
    const { name, dir } = parse(this.opts.componentName);
    this.name = name;
    this.dir = dir;
  }

  async run() {
    const { generateFile, appRoot, args } = this.opts;
    const capitalizeName = lodash.upperFirst(this.name);
    const base = join(
      this.opts.srcPath,
      'components',
      this.dir,
      capitalizeName,
    );

    const indexFile = join(base, 'index.ts');
    const compFile = join(base, `${capitalizeName}.tsx`);

    await processGenerateFile(
      {
        fromToMapping: [
          {
            from: join(appRoot, USER_TEMPLATE_COMP_DIR, 'index.ts.tpl'),
            fromFallback: INDEX_TPL,
            to: indexFile,
          },
          {
            from: join(appRoot, USER_TEMPLATE_COMP_DIR, 'component.tsx.tpl'),
            fromFallback: COMP_TPL,
            to: compFile,
          },
        ],
        baseDir: appRoot,
        data: {
          compName: capitalizeName,
        },
        args,
      },
      generateFile,
    );
  }
}

const INDEX_TPL = join(TEMPLATES_DIR, 'generate/component/index.ts.tpl');
const COMP_TPL = join(TEMPLATES_DIR, 'generate/component/component.tsx.tpl');
const USER_TEMPLATE_COMP_DIR = 'templates/component';
