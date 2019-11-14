import { join } from 'path';
import { EventEmitter } from 'events';
import { TaskState, TaskEventType, TaskType } from '../enums';
import { ITaskDetail } from '../types';
import { ChildProcess } from 'child_process';

export interface ITaskOptions {
  cwd: string;
  key: string;
}
/**
 * BaseTask
 *  1. 状态管理
 *  2. 日志管理
 *  3. 进程管理
 */
export class BaseTask extends EventEmitter {
  public cwd: string = '';
  public key: string = '';
  public state: TaskState = TaskState.INIT;
  public type: TaskType;
  public log: string = ''; // 日志
  public proc: ChildProcess; // 当前进程
  private subscribeInitFlag: boolean = false;
  private isCancel: boolean = false;
  protected progress: number = 0; // 进度，只有 dev 和 build 需要

  protected pkgPath: string = '';
  protected isBigfishProject: boolean = false;

  constructor({ cwd, key }: ITaskOptions) {
    super();
    this.cwd = cwd;
    this.key = key;
    this.pkgPath = join(cwd, 'package.json');
    this.isBigfishProject = !!process.env.BIGFISH_COMPAT;
  }

  public async init(collector) {
    if (this.subscribeInitFlag) {
      return;
    }
    this.subscribeInitFlag = true;
    this.on(TaskEventType.STD_OUT_DATA, data => {
      this.log = `${this.log}${data}`;
      collector({
        cwd: this.cwd,
        type: 'org.umi.task.log',
        payload: {
          key: this.key,
          taskType: this.type,
          log: data,
        },
      });
    });

    this.on(TaskEventType.STD_ERR_DATA, data => {
      this.log = `${this.log}${data}`;
      collector({
        cwd: this.cwd,
        type: 'org.umi.task.log',
        payload: {
          taskType: this.type,
          key: this.key,
          cwd: this.cwd,
          log: data,
        },
      });
    });

    this.on(TaskEventType.STATE_EVENT, detail => {
      (async () => {
        collector({
          cwd: this.cwd,
          type: 'org.umi.task.state',
          payload: {
            cwd: this.cwd,
            taskType: this.type,
            detail: detail || (await this.getDetail()),
          },
        });
      })();
    });
  }

  public clearLog() {
    this.log = '';
  }

  public getLog() {
    return this.log;
  }

  public async run(args = {}, envs: any = {}) {
    this.state = TaskState.ING;
    this.emit(TaskEventType.STATE_EVENT, await this.getDetail());
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
    this.isCancel = true;
    proc.kill('SIGTERM');
  }

  public async getDetail(_?: string): Promise<ITaskDetail> {
    return {
      state: this.state,
      type: this.type,
      progress: this.progress,
    };
  }

  protected handleChildProcess(proc: ChildProcess) {
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', log => {
      this.emit(TaskEventType.STD_OUT_DATA, log);
    });
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', log => {
      this.emit(TaskEventType.STD_ERR_DATA, log);
    });
    proc.on('exit', (code, signal) => {
      (async () => {
        if (signal === 'SIGINT') {
          // 用户取消任务
          this.state = TaskState.INIT;
        } else {
          if (this.isCancel) {
            this.state = TaskState.INIT;
            this.isCancel = false;
          } else {
            this.state = code !== 0 ? TaskState.FAIL : TaskState.SUCCESS;
          }
        }
        // 触发事件
        this.emit(TaskEventType.STATE_EVENT, await this.getDetail());
      })();
    });

    process.on('exit', () => {
      proc.kill('SIGTERM');
    });
  }

  protected updateProgress(msg) {
    if (!msg.progress) {
      return;
    }
    const { percentage } = msg.progress;
    const current = Number(Number(percentage).toFixed(2));
    if (current <= this.progress) {
      return;
    }
    this.progress = current;
    (async () => {
      this.emit(TaskEventType.STATE_EVENT, await this.getDetail());
    })();
  }

  protected error(msg: string) {
    const err = new Error(msg);
    err.name = 'BaseTaskError';
    throw err;
  }
}
