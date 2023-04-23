import { rimraf } from '@umijs/utils';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { error, info } from '../logger';

export class Runner {
  cwd: string;
  constructor(opts: { cwd: string }) {
    this.cwd = opts.cwd;
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

    writeFileSync(
      eslintrcjsFile,
      this.getRuleCode(rules, plugins, globals),
      'utf-8',
    );
    info(`Create ${eslintrcjsFile}`);
  }

  getRuleCode(rules: Record<string, any>, plugins: any, globals: any) {
    return `
module.exports = {
  extends: require.resolve('umi/eslint'),
  rules: ${JSON.stringify(rules, null, 2)},
  ${plugins ? `plugins: ${JSON.stringify(plugins, null, 2)},` : ''}
  ${globals ? `globals: ${JSON.stringify(globals, null, 2)},` : ''}
};
    `;
  }
}
