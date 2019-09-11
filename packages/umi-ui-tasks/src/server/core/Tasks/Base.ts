import { join } from 'path';
import { EventEmitter } from 'events';
import { TaskState, TaskEventType, TaskType } from '../enums';
import { ITaskDetail } from '../types';
import { ChildProcess } from 'child_process';

export interface ITaskOptions {
  cwd: string;
}
/**
 * BaseTask
 *  1. 状态管理
 *  2. 日志管理
 *  3. 进程管理
 */
export class BaseTask extends EventEmitter {
  public cwd: string = '';
  public state: TaskState = TaskState.INIT;
  public type: TaskType;
  public log: string = ''; // 日志
  public proc: ChildProcess; // 当前进程
  private subscribeInitFlag: boolean = false;
  private isCancel: boolean = false;

  protected pkgPath: string = '';
  protected isBigfishProject: boolean = false;

  constructor({ cwd }: ITaskOptions) {
    super();
    this.cwd = cwd;
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
          log: data,
        },
      });
    });

    this.on(TaskEventType.STATE_EVENT, () => {
      collector({
        cwd: this.cwd,
        type: 'org.umi.task.state',
        payload: {
          taskType: this.type,
          detail: this.getDetail(),
        },
      });
    });
  }

  public clearLog() {
    this.log = '';
  }

  public getLog() {
    return this.log;
  }

  public async run(_: any = {}) {
    this.state = TaskState.ING;
    this.emit(TaskEventType.STATE_EVENT, this.state);
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
    proc.kill('SIGINT');
  }

  public getDetail(): ITaskDetail {
    return {
      state: this.state,
      type: this.type,
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
      this.emit(TaskEventType.STATE_EVENT, this.state);
    });

    // TODO: 这儿缺少信号
    process.on('exit', () => {
      proc.kill();
    });
  }
}
