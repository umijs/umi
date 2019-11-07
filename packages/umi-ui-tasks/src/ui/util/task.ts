import { ITaskDetail } from '../../server/core/types';
import { TaskType } from '../../server/core/enums';
import { callRemote } from './index';

export enum TriggerState {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export interface IExecResult {
  triggerState: TriggerState;
  errMsg?: string;
  result?: ITaskDetail;
}

const runTask = async (taskType: TaskType, args = {}, env?: any) => {
  let result = {};
  let errMsg = '';
  let triggerState = TriggerState.SUCCESS;

  try {
    result = await callRemote({
      type: 'tasks/run',
      payload: {
        type: taskType,
        args,
        env: env ? env : {},
      },
    });
  } catch (e) {
    errMsg = e.message;
    triggerState = TriggerState.FAIL;
  }

  return {
    triggerState,
    result,
    errMsg,
  };
};

const cancelTask = async (taskType: TaskType) => {
  let result = {};
  let errMsg = '';
  let triggerState = TriggerState.SUCCESS;

  try {
    result = await callRemote({
      type: 'tasks/cancel',
      payload: {
        type: taskType,
      },
    });
  } catch (e) {
    errMsg = e.stack;
    triggerState = TriggerState.FAIL;
  }

  return {
    triggerState,
    result,
    errMsg,
  };
};

const getTaskDetail = async (taskType: TaskType, log = true, dbPath = '') => {
  return await callRemote({
    type: 'tasks/detail',
    payload: {
      type: taskType,
      log,
      dbPath,
    },
  });
};

const exec = async (taskType: TaskType, env?: any): Promise<IExecResult> => {
  const { triggerState: runTaskTriggerState, errMsg } = await runTask(taskType, env);
  if (runTaskTriggerState === TriggerState.FAIL) {
    return {
      triggerState: TriggerState.FAIL,
      errMsg,
      result: null,
    };
  }

  return {
    triggerState: TriggerState.SUCCESS,
    errMsg: '',
  };
};

const cancel = async (taskType: TaskType): Promise<IExecResult> => {
  const { triggerState: runTaskTriggerState, errMsg } = await cancelTask(taskType);
  if (runTaskTriggerState === TriggerState.FAIL) {
    return {
      triggerState: TriggerState.FAIL,
      errMsg,
      result: null,
    };
  }
  return {
    triggerState: TriggerState.SUCCESS,
    errMsg: '',
  };
};

const clearLog = async (taskType: TaskType) => {
  await callRemote({
    type: 'tasks/clearLog',
    payload: {
      type: taskType,
    },
  });
};

export {
  // base
  runTask,
  cancelTask,
  getTaskDetail,
  exec,
  cancel,
  clearLog,
};
