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
        /**
         * 抛错有两种情况
         *  1. 任务执行出错
         *  2. 用户取消后，会杀死子进程，子进程可能 edit(1)
         */
        if (!this.isCancel) {
          this.state = FlowState.FAIL;
          this.emit('state', {
            ...args,
            state: FlowState.FAIL,
          });
        }
        break;
      }
    }
    if (hasBreak) {
      return this.ctx.result;
    }

    // 完成之后触发一下完成事件，前端更新一下按钮状态
    this.state = FlowState.SUCCESS;
    const { generator } = this.ctx.stages;
    this.emit('state', {
      data: {
        ...args,
        previewUrl: `http://localhost:${process.env.PORT || '8000'}${generator.path.toLowerCase()}`,
      },
      state: FlowState.SUCCESS,
    });

    // 清空日志
    this.logger.clear();
    return this.ctx.result;
  }

  public cancel() {
    if (this.state !== FlowState.ING) {
      const err = new Error(`Error state(${this.state}) to terminated`);
      err.name = 'FlowError';
      throw err;
    }
    this.isCancel = true;
    this.state = FlowState.CANCEL;
    if (this.proc) {
      this.proc.kill('SIGTERM');
    }
    setTimeout(() => {
      this.emit('log', {
        data: '\n🛑  Stopped task success!\n',
      });
    }, 2000);
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
