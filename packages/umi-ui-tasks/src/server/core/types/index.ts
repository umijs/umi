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
  log?: string;
  progress?: number;
  analyze?: any;
  hasError?: boolean; // dev 启动中用到
  analyzePort?: number; // dev analyze 端口
  stats?: any;
}

export interface ICollectorData {
  cwd: string;
  eventType: string;
  taskType: TaskType;
  log?: string;
  detail?: ITaskDetail;
}
