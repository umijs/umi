import { copyFileSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import { chalk, glob, mkdirp, Mustache, prompts, yargs } from '../index';

interface IOpts {
  cwd: string;
  args: yargs.Arguments;
}

class Generator {
  cwd: string;
  args: yargs.Arguments;
  prompts: any;

  constructor({ cwd, args }: IOpts) {
    this.cwd = cwd;
    this.args = args;
    this.prompts = {};
  }

  async run() {
    const questions = this.prompting();
    this.prompts = await prompts(questions);
    await this.writing();
  }

  prompting() {
    return [] as any;
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
    files.forEach((file: any) => {
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
