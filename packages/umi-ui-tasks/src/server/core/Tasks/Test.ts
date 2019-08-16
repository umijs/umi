import { BaseTask } from './Base';
import { TaskType } from '../enums';
import { ITaskOpts } from '../types';
import { isScriptKeyExit } from '../../util';

export class TestTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.TEST;
  }

  public async run() {
    const { cwd } = this.api;
    let command = 'npm run test';

    // 如果 test 脚本不存在，使用全局的 umi 进行构建
    if (!isScriptKeyExit(this.pkgPath, 'dev')) {
      command = this.isBigfishProject ? 'bigfish test' : 'umi test';
    }

    await this.runCommand(command, {
      cwd,
    });
  }
}
