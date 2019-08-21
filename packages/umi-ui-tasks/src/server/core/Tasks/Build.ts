import { BaseTask } from './Base';
import { TaskType } from '../enums';
import { ITaskOpts } from '../types';
import { isScriptKeyExist } from '../../util';

export class BuildTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.BUILD;
  }

  public async run(env: any = {}) {
    await super.run();

    const { cwd } = this.api;
    let command = 'npm run build';

    // 如果 build 脚本不存在，使用全局的 umi 进行构建
    if (!isScriptKeyExist(this.pkgPath, 'build')) {
      command = this.isBigfishProject ? 'bigfish build' : 'umi build';
    }

    await this.runCommand(command, {
      cwd,
      env,
    });
  }
}
