import { TaskType } from '../../server/core/enums';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { FitAddon } from 'xterm-addon-fit';

declare global {
  interface Window {
    Terminal: any;
  }
}

const { Terminal } = window;

function initTerminal() {
  const terminal = new (Terminal as any)({
    allowTransparency: true,
    theme: {
      background: '#15171C',
      foreground: '#ffffff73',
    },
    fontFamily: `operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace`,
    cursorBlink: false,
    cursorStyle: 'underline',
    disableStdin: true,
  });
  terminal.loadAddon(new WebLinksAddon());
  terminal.loadAddon(new FitAddon());
  return terminal;
}

const TASKS = [TaskType.BUILD, TaskType.DEV, TaskType.LINT, TaskType.TEST, TaskType.INSTALL];

const TERMINAL_MAPS = {};

const getTerminalIns = (taskType: TaskType, key: string) => {
  if (!key || !taskType) {
    return null;
  }
  if (TERMINAL_MAPS[key]) {
    return TERMINAL_MAPS[key][taskType];
  }

  TERMINAL_MAPS[key] = {};
  TASKS.forEach(taskType => {
    TERMINAL_MAPS[key][taskType] = initTerminal();
  });
  return TERMINAL_MAPS[key][taskType];
};

export { getTerminalIns };
