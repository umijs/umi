import { IUiApi } from 'umi-types';
import { TaskState, TaskType } from '../../server/core/enums';

export const TASK_TYPE_TEXT_MAP = {
  [TaskType.BUILD]: '构建',
  [TaskType.DEV]: '本地开发',
  [TaskType.LINT]: 'LINT',
  [TaskType.TEST]: '测试',
};
export const TASK_STATE_TEXT_MAP = {
  [TaskState.INIT]: '初始化',
  [TaskState.ING]: '执行中',
  [TaskState.SUCCESS]: '执行成功',
  [TaskState.FAIL]: '执行失败',
};

export const isCaredEvent = (taskType: TaskType, caredTaskType: TaskType): boolean => {
  if (!taskType || taskType !== caredTaskType) {
    return false;
  }
  return true;
};

let callRemote;
export function initApiToGloal(api: IUiApi) {
  callRemote = api.callRemote; // eslint-disable-line
}

export { callRemote };

export * from './task';
export * from './terminal';
