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

const NOTICE_MESSAGE_MAP = {
  [TaskType.BUILD]: {
    [TaskState.SUCCESS]: {
      title: '构建成功',
      message: '成功',
    },
    [TaskState.FAIL]: {
      title: '构建失败',
      message: '失败',
    },
  },
  [TaskType.DEV]: {
    [TaskState.SUCCESS]: {
      title: '启动成功',
      message: '成功',
    },
    [TaskState.FAIL]: {
      title: '启动失败',
      message: '失败',
    },
  },
  [TaskType.TEST]: {
    [TaskState.SUCCESS]: {
      title: '测试成功',
      message: '成功',
    },
    [TaskState.FAIL]: {
      title: '测试失败',
      message: '失败',
    },
  },
  [TaskType.LINT]: {
    [TaskState.SUCCESS]: {
      title: 'Lint 成功',
      message: '成功',
    },
    [TaskState.FAIL]: {
      title: 'Lint 失败',
      message: '失败',
    },
  },
};

export function getNoticeMessage(
  taskType: TaskType,
  state: TaskState,
): { type: any; title: string; message: string } {
  return {
    type: state === TaskState.SUCCESS ? 'success' : 'error',
    ...NOTICE_MESSAGE_MAP[taskType][state],
  };
}

let callRemote;
export function initApiToGloal(api: IUiApi) {
  callRemote = api.callRemote; // eslint-disable-line
}

export { callRemote };

export * from './task';
export * from './terminal';
