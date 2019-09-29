import { IApi } from 'umi-types';
import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { IFlowContext } from './types';
import { FlowState } from './enum';
import Logger from './Logger';
import execa from '../util/exec';

import { parseUrl, gitClone, gitUpdate, runGenerator, writeRoutes, install } from './tasks';

class Flow extends EventEmitter {
  public api: IApi;
  public ctx: IFlowContext;
  public tasks: any[] = [];
  public isCancel: boolean = false;
  public logger: Logger;
  public proc: ChildProcess;
  public state: FlowState = FlowState.INIT;

  constructor({ api }: { api: IApi }) {
    super();
    this.api = api;
    this.logger = new Logger();
    this.logger.on('log', data => {
      this.emit('log', data);
    });

    this.ctx = {
      execa: execa(this.logger, this.setProcRef.bind(this)),
      api: this.api,
      logger: this.logger,
      terminated: false,
      terminatedMsg: '',
      stages: {},
      result: {},
    };
    this.registryTasks();
  }

  public async run(args) {
    this.state = FlowState.ING;
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
        this.state = FlowState.FAIL;
        break;
      }
    }
    if (hasBreak) {
      return this.ctx.result;
    }

    // 完成之后触发一下完成事件，前端更新一下按钮状态
    this.emit('success', args);

    this.state = FlowState.SUCCESS;
    // 清空日志
    this.logger.clear();
    return this.ctx.result;
  }

  public cancel() {
    this.isCancel = true;
    this.state = FlowState.CANCEL;
    if (this.proc) {
      this.proc.kill('SIGTERM');
    }
    // TODO: 这样子也是有问题的。signal 传递并不是同步的
    this.emit('log', {
      data: '🛑  Stopped task success!',
    });
  }

  public getLog() {
    return this.logger.getLog();
  }

  public getBlockUrl() {
    if (this.state !== FlowState.ING) {
      return '';
    }
    return this.ctx.result.blockUrl;
  }

  private registryTasks() {
    [parseUrl, gitClone, gitUpdate, install, runGenerator, writeRoutes].forEach(task => {
      this.tasks.push(task);
    });
  }

  private setProcRef(proc) {
    this.proc = proc;
  }
}

export default Flow;
