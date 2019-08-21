import { TaskType } from '../../server/core/enums';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Terminal as XTerminal } from 'xterm';

declare global {
  interface Window {
    fit: any;
    webLinks: any;
  }
}

const { fit, webLinks, Terminal } = window;

function initTerminal() {
  Terminal.applyAddon(fit);
  const terminal = new (Terminal as typeof XTerminal)({
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
