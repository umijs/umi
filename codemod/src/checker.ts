import { execa } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import { error, warn } from './logger';
import { Context } from './types';

export class Checker {
  cwd: string;
  context: Context;
  constructor(opts: { cwd: string; context: Context }) {
    this.cwd = opts.cwd;
    this.context = opts.context;
  }

  async run() {
    const config = this.context.config;
    const pkg = this.context.pkg;
    const errors: Error[] = [];

    // check git status
    if (process.env.GIT_CHECK !== 'none') {
      if (!existsSync(join(this.cwd, '.git'))) {
        errors.push(new Error(`当前目录 ${this.cwd} 不是 git 仓库，请确认！`));
      }
      const { stdout } = await execa.execa('git', ['status', '--porcelain']);
      if (stdout.length > 0) {
        errors.push(
          new Error(
            'Git 状态不是 clean，请确认！或者通过加 GIT_CHECK=none 环境变量跳过检查！',
          ),
        );
      }
    }

    // check config
    if (config.mpa) {
      errors.push(new Error(`mpa 应用暂不支持升级`));
    }
    if (config.ssr) {
      errors.push(new Error(`ssr 应用暂不支持升级`));
    }
    if (config.singular) {
      warn(
        `Umi 4 不再支持 singular 属性，默认复数目录，您仍在使用单数目录，请手动重命为复数形式。
      - 必要变更：page => pages、model => models、locale => locales、layout => layouts
      - src 下其他目录也建议使用复数形式，例如：utils、services、components 等`,
      );
    }

    // check pkg
    const umiName = 'umi';
    const umiVersion: string =
      pkg.dependencies?.[umiName] || pkg.devDependencies?.[umiName];
    if (!umiVersion?.match(/^[\^]{0,1}(3|4)/)) {
      errors.push(
        new Error(`仅支持从 umi 3 项目升级，但该项目中依赖 umi@${umiVersion}`),
      );
    }

    // print error
    errors.forEach((err) => {
      error(err.message);
    });

    if (errors.length) {
      process.exit(1);
    }
  }
}
