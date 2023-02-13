import { copyFileSync, statSync } from 'fs';
import { dirname } from 'path';
import fsExtra from '../../compiled/fs-extra';
import prompts from '../../compiled/prompts';
import Generator from '../Generator/Generator';

interface IOpts {
  path: string;
  target: string;
  baseDir?: string;
  data?: any;
  questions?: prompts.PromptObject[];
  slient?: boolean;
}

export default class BaseGenerator extends Generator {
  path: string;
  target: string;
  data: any;
  questions: prompts.PromptObject[];
  slient: boolean;

  constructor({ path, target, data, questions, baseDir, slient }: IOpts) {
    super({ baseDir: baseDir || target, args: data });
    this.path = path;
    this.target = target;
    this.data = data;
    this.questions = questions || [];
    this.slient = !!slient;
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
        slient: this.slient,
      });
    } else {
      if (this.path.endsWith('.tpl')) {
        this.copyTpl({
          templatePath: this.path,
          target: this.target,
          context,
          slient: this.slient,
        });
      } else {
        const absTarget = this.target;
        fsExtra.mkdirpSync(dirname(absTarget));
        copyFileSync(this.path, absTarget);
      }
    }
  }
}
