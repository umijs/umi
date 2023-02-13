import { copyFileSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import chalk from '../../compiled/chalk';
import fsExtra from '../../compiled/fs-extra';
import glob from '../../compiled/glob';
import Mustache from '../../compiled/mustache';
import prompts from '../../compiled/prompts';
import yParser from '../../compiled/yargs-parser';

export interface IGeneratorOpts {
  baseDir: string;
  args: yParser.Arguments;
  slient?: boolean;
}

interface IGeneratorBaseOpts {
  context: Record<string, any>;
  target: string;
}

interface IGeneratorCopyTplOpts extends IGeneratorBaseOpts {
  templatePath: string;
}

interface IGeneratorCopyDirectoryOpts extends IGeneratorBaseOpts {
  path: string;
}

class Generator {
  baseDir: string;
  args: yParser.Arguments;
  slient: boolean;
  prompts: any;

  constructor({ baseDir, args, slient }: IGeneratorOpts) {
    this.baseDir = baseDir;
    this.args = args;
    this.slient = !!slient;

    this.prompts = {};
  }

  async run() {
    const questions = this.prompting();
    this.prompts = await prompts(questions, {
      onCancel() {
        process.exit(1);
      },
    });
    await this.writing();
  }

  prompting() {
    return [] as any;
  }

  async writing() {}

  copyTpl(opts: IGeneratorCopyTplOpts) {
    const tpl = readFileSync(opts.templatePath, 'utf-8');
    const content = Mustache.render(tpl, opts.context);
    fsExtra.mkdirpSync(dirname(opts.target));
    if (!this.slient) {
      console.log(
        `${chalk.green('Write:')} ${relative(this.baseDir, opts.target)}`,
      );
    }
    writeFileSync(opts.target, content, 'utf-8');
  }

  copyDirectory(opts: IGeneratorCopyDirectoryOpts) {
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
        if (!this.slient) {
          console.log(`${chalk.green('Copy: ')} ${file}`);
        }
        const absTarget = join(opts.target, file);
        fsExtra.mkdirpSync(dirname(absTarget));
        copyFileSync(absFile, absTarget);
      }
    });
  }
}

export default Generator;
