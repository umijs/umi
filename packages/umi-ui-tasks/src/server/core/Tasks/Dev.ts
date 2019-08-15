import { BaseTask } from './Base';
import { TaskType } from '../enums';
import { ITaskOpts } from '../types';

export class DevTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.DEV;
  }

  public async run() {
    const { cwd } = this.api;
    await this.runCommand('npm run dev', {
      cwd,
    });
  }
}
