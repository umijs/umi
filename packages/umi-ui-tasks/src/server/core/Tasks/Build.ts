import { BaseTask, ITaskOptions } from './Base';
import { TaskType } from '../enums';
import { isScriptKeyExist, runCommand } from '../../util';

export class BuildTask extends BaseTask {
  constructor(opts: ITaskOptions) {
    super(opts);
    this.type = TaskType.BUILD;
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

    if (isScriptKeyExist(this.pkgPath, 'build')) {
      command = 'npm run build';
    } else if (this.isBigfishProject) {
      command = 'bigfish build'; // TODO: 优先使用 node_modules 中的命令？
    } else {
      command = 'umi build'; // TODO: 优先使用 node_modules 中的命令？
    }

    return command;
  }
}
