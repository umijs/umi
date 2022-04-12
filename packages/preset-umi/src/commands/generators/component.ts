import { GeneratorType } from '@umijs/core';
import { generateFile, lodash } from '@umijs/utils';
import { join, parse } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { GeneratorHelper } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:component',
  });

  api.registerGenerator({
    key: 'component',
    name: 'Generate Component',
    type: GeneratorType.generate,

    fn: async (options) => {
      const h = new GeneratorHelper(api);
      options.generateFile;

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
          generateFile,
          componentName: cn,
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
    },
  ) {
    const { name, dir } = parse(this.opts.componentName);
    this.name = name;
    this.dir = dir;
  }

  async run() {
    const { generateFile, appRoot } = this.opts;
    const capitalizeName = lodash.capitalize(this.name);
    const base = join(
      this.opts.srcPath,
      'components',
      this.dir,
      capitalizeName,
    );

    const indexFile = join(base, 'index.ts');
    const compFile = join(base, `${capitalizeName}.tsx`);

    await generateFile({
      target: indexFile,
      path: INDEX_TPL,
      baseDir: appRoot,
      data: { compName: capitalizeName },
    });

    await generateFile({
      target: compFile,
      path: COMP_TPL,
      baseDir: appRoot,
      data: { compName: capitalizeName },
    });
  }
}

const INDEX_TPL = join(TEMPLATES_DIR, 'generate/component/index.ts.tpl');
const COMP_TPL = join(TEMPLATES_DIR, 'generate/component/component.tsx.tpl');
