import { TaskType } from '../../server/core/enums';
import { WebLinksAddon } from 'xterm-addon-web-links';

declare global {
  interface Window {
    fit: any;
    webLinks: any;
    Terminal: any;
  }
}

const { fit, Terminal } = window;

function initTerminal() {
  (Terminal as any).applyAddon(fit);
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
