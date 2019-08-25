import { join } from 'path';
import { BaseTask, ITaskOptions } from './Base';
import { TaskType, TaskEventType } from '../enums';
import { runCommand } from '../../util';
import rimraf from 'rimraf';

export class InstallTask extends BaseTask {
  constructor(opts: ITaskOptions) {
    super(opts);
    this.type = TaskType.INSTALL;
  }

  public async run() {
    await super.run();

    // 执行删除的日志需要自己处理
    try {
      this.emit(TaskEventType.STD_OUT_DATA, 'Cleaning node_modules...');
      await this.cleanNodeModules();
      this.emit(TaskEventType.STD_OUT_DATA, 'Cleaning node_modules success.\n');
    } catch (e) {
      this.emit(TaskEventType.STD_OUT_DATA, 'Cleaning node_modules error\n');
      this.emit(TaskEventType.STD_OUT_DATA, e.message + '\n');
    }

    this.proc = runCommand(this.getScript(), {
      cwd: this.cwd,
    });

    this.handleChildProcess(this.proc);
  }

  public async cleanNodeModules() {
    return new Promise((resolve, reject) => {
      const nodeModulePath = join(this.cwd, 'node_modules');
      rimraf(nodeModulePath, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // TODO: 根据不同的 npm client 选择不同的命令
  private getScript(): string {
    return 'tnpm install -d';
  }
}
