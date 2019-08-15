import { IApi } from 'umi-types';
import { BuildTask, DevTask, LintTask, TestTask, BaseTask } from './Tasks';
import { TaskType } from './enums';
import { ITasks, ITaskDetail } from './types';

class TaskManager {
  public api: IApi;
  private tasks: ITasks;

  constructor(api: IApi) {
    this.api = api;
    const opts = { api };
    this.tasks = {
      [TaskType.BUILD]: new BuildTask(opts),
      [TaskType.DEV]: new DevTask(opts),
      [TaskType.LINT]: new LintTask(opts),
      [TaskType.TEST]: new TestTask(opts),
    };
  }

  public getAllTasks(): Array<{ type: string; task: BaseTask }> {
    return Object.keys(this.tasks).map(type => ({
      type,
      task: this.tasks[type],
    }));
  }

  public getTask(type: TaskType): BaseTask {
    return this.tasks[type];
  }

  /**
   * 获取全部 task 的状态
   */
  public async getTasksState() {
    return Object.keys(this.tasks).map(type => {
      const task = this.tasks[type];
      return {
        type: task.type,
        state: task.state,
      };
    });
  }

  public getTaskDetail(type: TaskType): ITaskDetail {
    const task = this.tasks[type];
    return {
      type: task.type,
      state: task.state,
    };
  }
}

export default TaskManager;
