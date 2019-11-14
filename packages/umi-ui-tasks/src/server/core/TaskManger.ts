import { IApi } from 'umi-types';
import { BuildTask, DevTask, LintTask, TestTask, BaseTask, InstallTask } from './Tasks';
import { TaskType, TaskState } from './enums';
import { ITasks, ICollectorData } from './types';

/**
 * Tasks 管理，根据 cwd 做区分
 */
class TaskManager {
  public api: IApi;
  public currentCwd: string = '';
  private tasks: ITasks = {};
  private send: any; // 客户端消息触发器

  public async init(cwd: string, send, key: string) {
    this.currentCwd = cwd;
    this.send = send;

    if (this.tasks[cwd]) {
      return;
    }
    const opts = {
      cwd,
      key,
    };
    this.tasks[cwd] = {
      [TaskType.BUILD]: new BuildTask(opts),
      [TaskType.DEV]: new DevTask(opts),
      [TaskType.TEST]: new TestTask(opts),
      [TaskType.LINT]: new LintTask(opts),
      [TaskType.INSTALL]: new InstallTask(opts),
    };

    const projectTasks = this.tasks[cwd];
    Object.keys(this.tasks[cwd]).forEach(async taskType => {
      const task = projectTasks[taskType];
      await task.init(this.collector(this.currentCwd, this.send));
    });
  }

  public async getTask(type: TaskType): Promise<BaseTask> {
    return new Promise(resolve => {
      if (this.currentCwd) {
        const currentProjectTasks = this.tasks[this.currentCwd];
        resolve(currentProjectTasks[type]);
        return;
      }
      // TODO: 这儿写的不是很好
      setTimeout(() => {
        const currentProjectTasks = this.tasks[this.currentCwd];
        resolve(currentProjectTasks[type]);
      }, 1000);
    });
  }

  /**
   * 获取全部 task 的状态
   */
  public async getTasksState() {
    const res = {};
    const currentProjectTasks = this.tasks[this.currentCwd];
    for (const type of Object.keys(currentProjectTasks)) {
      res[type] = await currentProjectTasks[type].getDetail();
    }
    return res;
  }

  public async isDevServerAlive() {
    if (!this.currentCwd) {
      return false;
    }
    const currentProjectTasks = this.tasks[this.currentCwd];
    const devTask = currentProjectTasks && currentProjectTasks[TaskType.DEV];
    return devTask && devTask.state === TaskState.SUCCESS;
  }

  private collector(currentCwd: string, send) {
    return ({ cwd, ...otherData }: ICollectorData) => {
      if (currentCwd !== cwd) {
        return;
      }
      if (!send) {
        return;
      }
      send(otherData);
    };
  }
}

export default TaskManager;
