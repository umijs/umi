import { IApi } from 'umi-types';
import { join } from 'path';
import { ChildProcess, SpawnOptions } from 'child_process';
import { EventEmitter } from 'events';
import { TaskState, TaskEventType, TaskType } from '../enums';
import { error, runCommand } from '../../util';

export class BaseTask extends EventEmitter {
  public state: TaskState = TaskState.INIT;
  public proc: ChildProcess;
  public type: TaskType;

  protected api: IApi;
  protected pkgPath: string;
  protected isBigfishProject: boolean;

  constructor({ api }: { api: IApi }) {
    super();
    this.api = api;
    this.pkgPath = join(api.cwd, 'package.json');
    this.isBigfishProject = !!process.env.BIGFISH_COMPAT;
  }

  public async run() {
    error('Not implement');
    return null;
  }

  public async cancel() {
    const { proc } = this;
    if (!proc) {
      return;
    }

    // 子任务执行结束
    if ([TaskState.FAIL, TaskState.SUCCESS].indexOf(this.state) > -1) {
      return;
    }

    this.state = TaskState.INIT;
    // 杀掉子进程
    this.proc.kill('SIGTERM');
  }

  protected async runCommand(script: string, opts?: SpawnOptions): Promise<ChildProcess> {
    if (!script) {
      error('script can not be empty');
    }

    this.state = TaskState.ING;
    this.proc = runCommand(script, opts);
    const { proc } = this;

    proc.stdout.on('data', buf => {
      this.emit(TaskEventType.STD_OUT_DATA, buf.toString());
    });
    proc.stderr.on('data', buf => {
      this.emit(TaskEventType.STD_ERR_DATA, buf.toString());
    });

    proc.on('error', () => {
      this.state = TaskState.FAIL;
    });

    proc.on('close', (code, signal) => {
      if (signal === 'SIGTERM') {
        // 用户取消任务
        this.state = TaskState.INIT;
      } else {
        this.state = code !== 0 ? TaskState.FAIL : TaskState.SUCCESS;
      }

      this.emit(TaskEventType.STATE_EVENT, this.state);
    });
    return proc;
  }
}
