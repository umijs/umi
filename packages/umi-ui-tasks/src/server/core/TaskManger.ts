import { IApi } from 'umi-types';
import { BuildTask, DevTask, LintTask, TestTask, BaseTask, InstallTask } from './Tasks';
import { TaskType } from './enums';
import { ITasks, ICollectorData, ITaskDetail } from './types';

/**
 * Tasks 管理，根据 cwd 做区分
 */
class TaskManager {
  public api: IApi;
  private tasks: ITasks = {};
  private currentCwd: string = '';
  private send: any; // 客户端消息触发器

  public async init(cwd: string, send) {
    this.currentCwd = cwd;
    this.send = send;

    if (this.tasks[cwd]) {
      return;
    }
    const opts = {
      cwd,
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

  public getTask(type: TaskType): BaseTask {
    const currentProjectTasks = this.tasks[this.currentCwd];
    return currentProjectTasks[type];
  }

  /**
   * 获取全部 task 的状态
   */
  public async getTasksState() {
    const currentProjectTasks = this.tasks[this.currentCwd];
    return Object.keys(currentProjectTasks).map(type => currentProjectTasks[type].getDetail());
  }

  public getTaskDetail(type: TaskType): ITaskDetail {
    const currentProjectTasks = this.tasks[this.currentCwd];
    return currentProjectTasks[type].getDetail();
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
