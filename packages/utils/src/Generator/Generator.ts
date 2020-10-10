import { copyFileSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, relative, join } from 'path';
import { chalk, mkdirp, Mustache, yargs, glob } from '../index';

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

  copyDirectory(opts: { path: string; context: object; target: string }) {
    const files = glob.sync('**/*', {
      cwd: opts.path,
      dot: true,
      ignore: ['**/node_modules/**'],
    });
    files.forEach((file) => {
      const absFile = join(opts.path, file);
      if (statSync(absFile).isDirectory()) return;
      if (file.endsWith('.tpl')) {
        this.copyTpl({
          templatePath: absFile,
          target: join(opts.target, file.replace(/\.tpl$/, '')),
          context: opts.context,
        });
      } else {
        console.log(`${chalk.green('Copy: ')} ${file}`);
        const absTarget = join(opts.target, file);
        mkdirp.sync(dirname(absTarget));
        copyFileSync(absFile, absTarget);
      }
    });
  }
}

export default Generator;
