import { IApi } from 'umi-types';
import { BaseTask } from '../Tasks';
import { TaskType, TaskState } from '../enums';

export interface ITasks {
  [key: string]: BaseTask;
}

export interface ITaskOpts {
  api: IApi;
}

export interface ITaskDetail {
  type: TaskType;
  state: TaskState;
}
