import { BaseTask, ITaskOptions } from './Base';
import { TaskType } from '../enums';
import { isScriptKeyExist, runCommand } from '../../util';

export class TestTask extends BaseTask {
  constructor(opts: ITaskOptions) {
    super(opts);
    this.type = TaskType.TEST;
  }

  public async run(env: any = {}) {
    await super.run();
    this.proc = runCommand(this.getScript(), {
      cwd: this.cwd,
      env, // 前端传入的 env
    });

    this.handleChildProcess(this.proc);
  }

  private getScript() {
    let command = '';

    if (isScriptKeyExist(this.pkgPath, 'test')) {
      command = 'npm run test';
    } else if (this.isBigfishProject) {
      command = 'bigfish test'; // TODO: 优先使用 node_modules 中的命令？
    } else {
      command = 'umi test'; // TODO: 优先使用 node_modules 中的命令？
    }

    return command;
  }
}
