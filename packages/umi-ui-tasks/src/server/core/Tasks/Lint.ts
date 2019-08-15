import { BaseTask } from './Base';
import { TaskType } from '../enums';
import { ITaskOpts } from '../types';

export class LintTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.LINT;
  }

  public async run() {
    const { cwd } = this.api;
    await this.runCommand('npm run lint', {
      cwd,
    });
  }
}
