import { TaskState, TaskType } from '../../server/core/enums';

export const isCaredEvent = (taskType: TaskType, caredTaskType: TaskType): boolean => {
  if (!taskType || taskType !== caredTaskType) {
    return false;
  }
  return true;
};

const NOTICE_MESSAGE_MAP = {
  [TaskType.BUILD]: {
    [TaskState.SUCCESS]: {
      title: 'org.umi.ui.tasks.notify.build.success.title',
      message: 'org.umi.ui.tasks.notify.build.success.message',
    },
    [TaskState.FAIL]: {
      title: 'org.umi.ui.tasks.notify.build.fail.title',
      message: 'org.umi.ui.tasks.notify.build.fail.message',
    },
  },
  [TaskType.DEV]: {
    [TaskState.SUCCESS]: {
      title: 'org.umi.ui.tasks.notify.dev.success.title',
      message: 'org.umi.ui.tasks.notify.dev.success.message',
    },
    [TaskState.FAIL]: {
      title: 'org.umi.ui.tasks.notify.dev.fail.title',
      message: 'org.umi.ui.tasks.notify.dev.fail.message',
    },
  },
  [TaskType.TEST]: {
    [TaskState.SUCCESS]: {
      title: 'org.umi.ui.tasks.notify.test.success.title',
      message: 'org.umi.ui.tasks.notify.test.success.message',
    },
    [TaskState.FAIL]: {
      title: 'org.umi.ui.tasks.notify.test.fail.title',
      message: 'org.umi.ui.tasks.notify.test.fail.message',
    },
  },
  [TaskType.LINT]: {
    [TaskState.SUCCESS]: {
      title: 'org.umi.ui.tasks.notify.lint.success.title',
      message: 'org.umi.ui.tasks.notify.lint.success.message',
    },
    [TaskState.FAIL]: {
      title: 'org.umi.ui.tasks.notify.lint.fail.title',
      message: 'org.umi.ui.tasks.notify.lint.fail.message',
    },
  },
  [TaskType.INSTALL]: {
    [TaskState.SUCCESS]: {
      title: 'org.umi.ui.tasks.notify.install.success.title',
      message: 'org.umi.ui.tasks.notify.install.success.message',
    },
    [TaskState.FAIL]: {
      title: 'org.umi.ui.tasks.notify.install.fail.title',
      message: 'org.umi.ui.tasks.notify.install.fail.message',
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

export * from './initApiToGlobal';
export * from './task';
export * from './terminal';
export * from './analyze';
