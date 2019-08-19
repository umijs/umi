import { BaseTask } from './Base';
import { TaskType, TaskState, TaskEventType } from '../enums';
import { ITaskOpts } from '../types';

export class LintTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.LINT;
  }

  public async run(env: any = {}) {
    await super.run();

    const { cwd } = this.api;
    await this.runCommand('npm run lint', {
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
