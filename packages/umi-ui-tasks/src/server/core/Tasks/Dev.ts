import { BaseTask } from './Base';
import { TaskType } from '../enums';
import { ITaskOpts } from '../types';
import { isScriptKeyExit } from '../../util';

export class DevTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.DEV;
  }

  public async run() {
    const { cwd } = this.api;
    let command = 'npm run dev';

    // 如果 dev 脚本不存在，使用全局的 umi 进行构建
    if (!isScriptKeyExit(this.pkgPath, 'dev')) {
      command = this.isBigfishProject ? 'bigfish dev' : 'umi dev';
    }

    await this.runCommand(command, {
      cwd,
    });
  }
}
