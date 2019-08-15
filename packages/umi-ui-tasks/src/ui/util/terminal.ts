import { TaskType } from '../../server/core/enums';

declare global {
  interface Window {
    Terminal: any;
    fit: any;
  }
}

const { Terminal, fit } = window;

function initTerminal() {
  (Terminal as any).applyAddon(fit);
  const terminal = new (Terminal as any)();
  return terminal;
}

const TASKS = [TaskType.BUILD, TaskType.DEV, TaskType.LINT, TaskType.TEST];

const TERMINAL_MAPS = {};

TASKS.forEach(taskType => {
  TERMINAL_MAPS[taskType] = initTerminal();
});

const getTerminalIns = (taskType: TaskType) => TERMINAL_MAPS[taskType];

export { getTerminalIns };
