import { BaseTask } from '../Tasks';
import { TaskType, TaskState } from '../enums';

export interface IProjectTasks {
  [key: string]: BaseTask;
}

export interface ITasks {
  [key: string]: IProjectTasks;
}

export interface ITaskDetail {
  type: TaskType;
  state: TaskState;
}

export interface ICollectorData {
  cwd: string;
  eventType: string;
  taskType: TaskType;
  log?: string;
  detail?: ITaskDetail;
}
