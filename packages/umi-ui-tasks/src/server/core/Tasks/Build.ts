import { BaseTask } from './Base';
import { TaskType } from '../enums';
import { ITaskOpts } from '../types';

export class BuildTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.BUILD;
  }

  public async run() {
    const { cwd } = this.api;
    await this.runCommand('npm run build', {
      cwd,
    });
  }
}
