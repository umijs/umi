import { copyFileSync, statSync } from 'fs';
import { dirname } from 'path';
import fsExtra from '../../compiled/fs-extra';
import prompts from '../../compiled/prompts';
import Generator, { type IGeneratorOpts } from '../Generator/Generator';

interface IBaseGeneratorOpts extends Partial<Omit<IGeneratorOpts, 'args'>> {
  path: string;
  target: string;
  data?: any;
  questions?: prompts.PromptObject[];
}

export default class BaseGenerator extends Generator {
  path: string;
  target: string;
  data: any;
  questions: prompts.PromptObject[];

  constructor({
    path,
    target,
    data,
    questions,
    baseDir,
    slient,
  }: IBaseGeneratorOpts) {
    super({ baseDir: baseDir || target, args: data, slient });
    this.path = path;
    this.target = target;
    this.data = data;
    this.questions = questions || [];
  }

  prompting() {
    return this.questions;
  }

  async writing() {
    const context = {
      ...this.data,
      ...this.prompts,
    };
    if (statSync(this.path).isDirectory()) {
      this.copyDirectory({
        context,
        path: this.path,
        target: this.target,
      });
    } else {
      if (this.path.endsWith('.tpl')) {
        this.copyTpl({
          templatePath: this.path,
          target: this.target,
          context,
        });
      } else {
        const absTarget = this.target;
        fsExtra.mkdirpSync(dirname(absTarget));
        copyFileSync(this.path, absTarget);
      }
    }
  }
}
