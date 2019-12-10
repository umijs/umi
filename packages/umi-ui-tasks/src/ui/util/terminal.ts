import { TaskType } from '../../server/core/enums';

const TERMINAL_MAPS = {};

export const getTerminalRefIns = (taskType: TaskType, key: string) => {
  if (!key || !taskType) {
    return null;
  }
  if (TERMINAL_MAPS[key]) {
    return TERMINAL_MAPS[key][taskType];
  }
};

export const setTerminalRefIns = (taskType: TaskType, key: string, ins) => {
  TERMINAL_MAPS[key] = {
    [taskType]: ins,
  };
};
