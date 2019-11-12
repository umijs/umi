import { BaseTask, ITaskOptions } from './Base';
import { TaskType } from '../enums';
import { parseScripts, runCommand } from '../../util';

export class TestTask extends BaseTask {
  constructor(opts: ITaskOptions) {
    super(opts);
    this.type = TaskType.TEST;
  }

  public async run(args = {}, env: any = {}) {
    await super.run();
    const { script, envs: scriptEnvs } = this.getScript();
    this.proc = runCommand(script, {
      cwd: this.cwd,
      env: {
        ...env,
        ...scriptEnvs,
      }, // 前端传入的 env
    });

    this.handleChildProcess(this.proc);
  }

  private getScript(): { script: string; envs: object } {
    const { succes, exist, errMsg, envs, bin } = parseScripts({
      pkgPath: this.pkgPath,
      key: 'test',
    });

    if (!exist) {
      return {
        script: this.isBigfishProject ? 'bigfish test' : 'umi test',
        envs: [],
      };
    }
    if (!succes) {
      this.error(errMsg);
    }
    return {
      script: `${bin} test`,
      envs,
    };
  }
}
