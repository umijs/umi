import { IApi } from 'umi-types';
import { IFlowContext } from './types';
import Logger from './Logger';
import execa from '../util/exec';

import { parseUrl, gitClone, gitUpdate, runGenerator, writeRoutes, install } from './tasks';

class Flow {
  public api: IApi;
  public ctx: IFlowContext;
  public tasks: any[] = [];
  public isCancel: boolean = false;
  public logger: Logger;

  constructor({ api }: { api: IApi }) {
    this.api = api;
    this.logger = new Logger();
    this.ctx = {
      execa: execa(this.logger),
      api: this.api,
      logger: this.logger,
      terminated: false,
      terminatedMsg: '',
      currentProc: null,
      stages: {},
      result: {},
    };
    this.registryTasks();
  }

  public async run(args) {
    let hasBreak = false;
    for (const task of this.tasks) {
      // 用户取消任务
      if (this.isCancel) {
        hasBreak = true;
        break;
      }
      // 子任务执行结束
      if (this.ctx.terminated) {
        hasBreak = true;
        break;
      }
      try {
        await task(this.ctx, args);
      } catch (e) {
        hasBreak = true;
        break;
      }
    }
    if (hasBreak) {
      return this.ctx.result;
    }

    // 清空日志
    this.logger.clear();
    return this.ctx.result;
  }

  public cancel() {
    this.isCancel = true;
    if (!this.ctx.currentProc) {
      this.ctx.currentProc.kill('SIGTERM');
    }
  }

  public getLog() {
    return this.logger.getLog();
  }

  public getBlockUrl() {
    return this.ctx.result.blockUrl;
  }

  private registryTasks() {
    [parseUrl, gitClone, gitUpdate, install, runGenerator, writeRoutes].forEach(task => {
      this.tasks.push(task);
    });
  }
}

export default Flow;
