import { ChildProcess } from 'child_process';
import stripAnsi from 'strip-ansi';
import { BaseTask, ITaskOptions } from './Base';
import { TaskState, TaskEventType, TaskType } from '../enums';
import { isScriptKeyExist, runCommand } from '../../util';

export class DevTask extends BaseTask {
  private started: boolean = false;
  private localUrl: string = '';
  private lanUrl: string = '';

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

  public async cancel() {
    this.started = false;
    const { proc } = this;
    if (!proc) {
      return;
    }

    // 子任务执行结束
    if ([TaskState.FAIL].indexOf(this.state) > -1) {
      return;
    }

    this.state = TaskState.INIT;
    proc.kill();
  }

  public getDetail() {
    return {
      ...super.getDetail(),
      started: this.started,
      localUrl: this.localUrl,
      lanUrl: this.lanUrl,
    };
  }

  protected handleChildProcess(proc: ChildProcess) {
    proc.stdout.on('data', buf => {
      const log = buf.toString();
      this.emit(TaskEventType.STD_OUT_DATA, log);
      this.guessStart(log);
    });
    proc.stderr.on('data', buf => {
      const log = buf.toString();
      this.emit(TaskEventType.STD_ERR_DATA, log);
    });
    proc.on('exit', (code, signal) => {
      if (signal === 'SIGTERM' || signal === 'SIGINT' || code === 130) {
        // 用户取消任务
        this.state = TaskState.INIT;
      } else {
        // 自然退出
        if (code! == 0) {
          this.state = TaskState.FAIL;
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

  private guessStart(msg: string) {
    if (this.started) {
      return;
    }
    if (!/running/.test(msg)) {
      return;
    }
    this.started = true;
    const [, localStr, lanStr] = stripAnsi(msg).split('\n');
    this.localUrl = this.parseUrl(localStr);
    this.lanUrl = this.parseUrl(lanStr);
    this.state = TaskState.SUCCESS;
    this.emit(TaskEventType.STATE_EVENT, this.state);
  }

  private parseUrl(str: string) {
    const hIndex = str.indexOf('h');
    const slashIndex = str.lastIndexOf('/');
    return str.substr(hIndex, slashIndex - hIndex);
  }
}
