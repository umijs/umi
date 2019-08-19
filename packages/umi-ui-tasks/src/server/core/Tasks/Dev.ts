import { BaseTask } from './Base';
import { TaskType, TaskState, TaskEventType } from '../enums';
import { ITaskOpts } from '../types';
import { isScriptKeyExit } from '../../util';

export class DevTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.DEV;
  }

  public async run(env: any = {}) {
    await super.run();

    const { cwd } = this.api;
    let command = 'npm run dev';

    // 如果 dev 脚本不存在，使用全局的 umi 进行构建
    if (!isScriptKeyExit(this.pkgPath, 'dev')) {
      command = this.isBigfishProject ? 'bigfish dev' : 'umi dev';
    }

    await this.runCommand(command, {
      cwd,
      env,
    });

    const { proc } = this;
    proc.on('close', (code, signal) => {
      if (signal === 'SIGTERM') {
        // 用户取消任务
        this.state = TaskState.INIT;
      } else {
        // 自然退出
        this.state = code !== 0 ? TaskState.FAIL : TaskState.SUCCESS;
      }
      // 触发事件
      this.emit(TaskEventType.STATE_EVENT, this.state);
    });
  }
}
