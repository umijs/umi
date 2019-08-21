import { BaseTask } from './Base';
import { TaskType } from '../enums';
import { ITaskOpts } from '../types';
import { isScriptKeyExist } from '../../util';

export class DevTask extends BaseTask {
  constructor(opts: ITaskOpts) {
    super(opts);
    this.type = TaskType.DEV;
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
    let command = '';
    if (isScriptKeyExist(this.pkgPath, 'start')) {
      command = 'npm start';
    } else if (isScriptKeyExist(this.pkgPath, 'dev')) {
      command = 'npm run dev';
    } else {
      command = this.isBigfishProject ? 'bigfish dev' : 'umi dev';
    }
    return command;
  }
}
