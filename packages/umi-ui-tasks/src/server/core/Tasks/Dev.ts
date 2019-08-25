import { BaseTask, ITaskOptions } from './Base';
import { TaskType } from '../enums';
// import { ITaskOpts } from '../types';
import { isScriptKeyExist, runCommand } from '../../util';

export class DevTask extends BaseTask {
  constructor(opts: ITaskOptions) {
    super(opts);
    this.type = TaskType.DEV;
  }

  public async run(env: any = {}) {
    await super.run();
    this.proc = runCommand(this.getScript(), {
      cwd: this.cwd,
      env, // 前端传入的 env
    });
    this.handleChildProcess(this.proc);
  }

  private getScript(): string {
    let command = '';
    if (isScriptKeyExist(this.pkgPath, 'start')) {
      command = 'npm start';
    } else if (isScriptKeyExist(this.pkgPath, 'dev')) {
      command = 'npm run dev';
    } else if (this.isBigfishProject) {
      command = 'bigfish dev';
    } else {
      command = 'umi dev';
    }
    return command;
  }
}
