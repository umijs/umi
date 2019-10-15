import { BaseTask, ITaskOptions } from './Base';
import { TaskType } from '../enums';
import { runCommand } from '../../util';

export class LintTask extends BaseTask {
  constructor(opts: ITaskOptions) {
    super(opts);
    this.type = TaskType.LINT;
  }

  public async run(args = {}, env: any = {}) {
    await super.run();
    this.proc = runCommand(this.getScript(), {
      cwd: this.cwd,
      env, // 前端传入的 env
    });

    this.handleChildProcess(this.proc);
  }

  private getScript() {
    return 'npm run lint';
  }
}
