import { ChildProcess } from 'child_process';
import { BaseTask, ITaskOptions } from './Base';
import { TaskState, TaskEventType, TaskType } from '../enums';
import { runCommand, parseScripts, getDevAnalyzeEnv } from '../../util';

export class DevTask extends BaseTask {
  // 是否已经启动
  private started: boolean = false;
  // local url
  private localUrl: string = '';
  // lan url
  private lanUrl: string = '';
  // 启动中也会有 hasError 的情况
  private hasError: boolean = false;
  // analyze port
  private analyzePort: number;

  constructor(opts: ITaskOptions) {
    super(opts);
    this.type = TaskType.DEV;
  }

  public async run(_, env: any = {}) {
    await super.run();
    const { script, envs: scriptEnvs } = this.getScript();
    const analyzeEnv = await getDevAnalyzeEnv();
    this.analyzePort = analyzeEnv.ANALYZE_PORT;

    this.proc = await runCommand(
      script,
      {
        cwd: this.cwd,
        env: {
          ...env, // 前端 env
          ...analyzeEnv, // analyze env
          ...scriptEnvs, // script 解析到的
        },
      },
      true,
    );

    this.handleChildProcess(this.proc);
  }

  public async cancel() {
    this.reset();

    const { proc } = this;
    if (!proc) {
      return;
    }

    // 子任务执行结束
    if ([TaskState.FAIL].indexOf(this.state) > -1) {
      return;
    }

    this.state = TaskState.INIT;
    proc.kill('SIGTERM');
  }

  public async getDetail() {
    return {
      ...(await super.getDetail()),
      started: this.started,
      localUrl: this.localUrl,
      lanUrl: this.lanUrl,
      progress: this.progress,
      hasError: this.hasError,
      analyzePort: this.state === TaskState.SUCCESS ? this.analyzePort : null,
    };
  }

  protected handleChildProcess(proc: ChildProcess) {
    proc.on('message', msg => {
      this.updateState(msg);
    });

    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', log => {
      this.emit(TaskEventType.STD_OUT_DATA, log);
    });

    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', log => {
      this.emit(TaskEventType.STD_ERR_DATA, log);
    });

    proc.on('exit', (code, signal) => {
      this.state = code === 1 ? TaskState.FAIL : TaskState.INIT;
      (async () => {
        this.emit(TaskEventType.STATE_EVENT, await this.getDetail());
      })();
    });

    process.on('exit', () => {
      proc.kill('SIGTERM');
    });
  }

  protected updateProgress(msg) {
    if (this.hasError) {
      this.hasError = false;
    }
    super.updateProgress(msg);
  }

  private getScript(): { script: string; envs: object } {
    let res = parseScripts({
      pkgPath: this.pkgPath,
      key: 'start',
    });
    if (!res.exist) {
      res = parseScripts({
        pkgPath: this.pkgPath,
        key: 'dev',
      });
    }

    const { succes, exist, errMsg, envs, bin, args } = res;

    // No specified dev or start script
    if (!exist) {
      return {
        script: this.isBigfishProject ? 'bigfish dev' : 'umi dev',
        envs: [],
      };
    }
    // Parse script error
    if (!succes) {
      this.error(errMsg);
    }

    return {
      script: `${bin} ${args.join(' ')}`,
      envs,
    };
  }

  private updateState(msg) {
    if (this.started) {
      return;
    }

    const { type } = msg;
    switch (type) {
      case 'DONE':
        this.success(msg);
        break;
      case 'STARTING':
        this.updateProgress(msg);
        break;
      case 'ERROR':
        this.updateError();
        break;
      default:
    }
  }

  private updateError() {
    this.hasError = true;
    (async () => {
      this.emit(TaskEventType.STATE_EVENT, await this.getDetail());
    })();
  }

  private success(msg) {
    const { urls } = msg;
    this.hasError = false;
    this.started = true;
    this.localUrl = urls.rawLocal;
    this.lanUrl = urls.rawLanUrl;
    this.state = TaskState.SUCCESS;
    (async () => {
      this.emit(TaskEventType.STATE_EVENT, await this.getDetail());
    })();
  }

  private reset() {
    this.started = false;
    this.localUrl = '';
    this.lanUrl = '';
    this.hasError = false;
    this.analyzePort = null;
    this.progress = 0;
  }
}
