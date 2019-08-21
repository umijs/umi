import { BaseTask } from './Base';
import { TaskType } from '../enums';
import { ITaskOpts } from '../types';

export class InstallTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.INSTALL;
  }

  public async run(env: any = {}) {
    const { cwd } = this.api;
    await super.run();

    await this.runCommand(this.getScript(), {
      cwd,
      env,
    });
  }

  private getScript(): string {
    return 'rm -rf node_modules && tnpm install -d';
  }
}
