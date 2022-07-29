import { rimraf } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { error, info } from '../logger';
import { Context } from '../types';
import { writePrettierFileSync } from '../utils/writePrettierFileSync';

export class Runner {
  cwd: string;
  context: Context;
  constructor(opts: { cwd: string; context: Context }) {
    this.cwd = opts.cwd;
    this.context = opts.context;
  }

  run() {
    const eslintrcFile = join(this.cwd, '.eslintrc');
    const eslintrcjsFile = join(this.cwd, '.eslintrc.js');

    let rules = {};
    let plugins;
    let globals;
    if (existsSync(eslintrcFile)) {
      const lintConfig = JSON.parse(readFileSync(eslintrcFile, 'utf8'));
      rules = lintConfig.rules || {};
      plugins = lintConfig.plugins;
      globals = lintConfig.globals;
      rimraf.sync(eslintrcFile);
      info(`Delete ${eslintrcFile}`);
    }
    if (existsSync(eslintrcjsFile)) {
      try {
        const lintConfig = require(eslintrcjsFile);
        rules = lintConfig.rules || {};
        plugins = lintConfig.plugins;
        globals = lintConfig.globals;
      } catch (e) {
        error(`${eslintrcjsFile} is not a valid eslintrc.js file`);
        error((e as Error).message);
      }
      rimraf.sync(eslintrcjsFile);
      info(`Delete ${eslintrcjsFile}`);
    }

    writePrettierFileSync(
      eslintrcjsFile,
      this.getRuleCode(rules, plugins, globals),
    );
    info(`Create ${eslintrcjsFile}`);
  }

  getRuleCode(rules: Record<string, any>, plugins: any, globals: any) {
    return `
module.exports = {
  extends: require.resolve('${this.context.importSource || 'umi'}/eslint'),
  rules: ${JSON.stringify(rules, null, 2)},
  ${plugins ? `plugins: ${JSON.stringify(plugins, null, 2)},` : ''}
  ${globals ? `globals: ${JSON.stringify(globals, null, 2)},` : ''}
};
    `;
  }
}
