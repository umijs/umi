import { BaseTask } from './Base';
import { TaskType } from '../enums';
import { ITaskOpts } from '../types';

export class TestTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.TEST;
  }

  public async run() {
    const { cwd } = this.api;
    await this.runCommand('npm run test', {
      cwd,
    });
  }
}
