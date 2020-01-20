import { readFileSync, writeFileSync } from 'fs';
import { dirname, relative } from 'path';
import { chalk, mkdirp, Mustache, yargs } from '../index';

interface IOpts {
  cwd: string;
  args: yargs.Arguments;
}

class Generator {
  cwd: string;
  args: yargs.Arguments;

  constructor({ cwd, args }: IOpts) {
    this.cwd = cwd;
    this.args = args;
  }

  async run() {
    await this.writing();
  }

  async writing() {}

  copyTpl(opts: { templatePath: string; target: string; context: object }) {
    const tpl = readFileSync(opts.templatePath, 'utf-8');
    const content = Mustache.render(tpl, opts.context);
    mkdirp.sync(dirname(opts.target));
    console.log(`${chalk.green('Write:')} ${relative(this.cwd, opts.target)}`);
    writeFileSync(opts.target, content, 'utf-8');
  }
}

export default Generator;
