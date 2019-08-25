import { TaskType } from '../../server/core/enums';
import { WebLinksAddon } from 'xterm-addon-web-links';

declare global {
  interface Window {
    Terminal: any;
    fit: any;
    webLinks: any;
  }
}

const { Terminal, fit } = window;

function initTerminal() {
  (Terminal as any).applyAddon(fit);
  const terminal = new (Terminal as any)({
    allowTransparency: true,
    theme: {
      background: '#15171C',
      foreground: '#ffffff73',
    },
    cursorBlink: false,
    cursorStyle: 'bar',
    disableStdin: true,
  });
  terminal.loadAddon(new WebLinksAddon());
  return terminal;
}

const TASKS = [TaskType.BUILD, TaskType.DEV, TaskType.LINT, TaskType.TEST, TaskType.INSTALL];

const TERMINAL_MAPS = {};

TASKS.forEach(taskType => {
  TERMINAL_MAPS[taskType] = initTerminal();
});

const getTerminalIns = (taskType: TaskType) => TERMINAL_MAPS[taskType];

export { getTerminalIns };
