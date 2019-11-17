import sockjs, { Connection } from 'sockjs';
import get from 'lodash/get';
// import { sync as osLocaleSync } from 'os-locale';
// umiui:UmiUI:terminal
import { debugTerminal as _log } from './debug';

let term;

export interface IOpts {
  cwd: string;
  data: any;
  rows?: number;
  cols?: number;
}

/**
 * get user default shell
 * /bin/zsh /bin/bash
 */
export const getDefaultShell = () => {
  if (process.platform === 'darwin') {
    return process.env.SHELL || '/bin/bash';
  }

  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'cmd.exe';
  }
  return process.env.SHELL || '/bin/sh';
};

/**
 * Security Check
 *
 */
const securityCheck = (conn: Connection) => {
  if (process.env.HOST === '0.0.0.0') {
    conn.write('The current environment is not safe.');
    return false;
  }
  return true;
};

export const resizeTerminal = (opts: Pick<IOpts, 'cols' | 'rows'>) => {
  const { cols, rows } = opts;
  if (term && cols && rows) {
    term.resize(cols, rows);
  }
};

/**
 * export terminal socket init needs bind express app server
 */
export default function(server) {
  const terminalSS = sockjs.createServer();
  terminalSS.on('connection', conn => {
    const { currentProject, projectsByKey } = this.config.data;
    const currentProjectCwd = get(projectsByKey, `${currentProject}.path`);
    const cwd = currentProjectCwd || this.cwd || process.cwd();
    // insecurity env to run shell
    const safe = securityCheck(conn);
    let spawn;
    try {
      // eslint-disable-next-line prefer-destructuring
      spawn = require('node-pty').spawn;
    } catch (e) {
      conn.write(
        'Failed to install or prebuild node-pty module, please see docs: https://umijs.org/guide/faq.html#terminal-need-node-pty-module',
      );
      return false;
    }
    if (safe) {
      const defaultShell = getDefaultShell();
      const defaultShellArgs = ['--login'];
      term = spawn(defaultShell, defaultShellArgs, {
        name: 'xterm-color',
        cols: 180,
        rows: 30,
        cwd,
        env: {
          ...process.env,
          // LANG: `${osLocaleSync()}.UTF-8`,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
        },
      });
      /**
       * stringify command shell string
       * @param command ls/... shell commands
       */
      term.onData(chunk => {
        // _log('ptyProcess data', chunk);
        conn.write(chunk);
      });

      // === socket listener ===
      conn.on('data', data => {
        // _log('terminal conn message', data);
        term.write(data);
      });
      conn.on('close', () => {
        // maybe change the pty cwd
        term.kill();
      });
    }
  });
  terminalSS.installHandlers(server, {
    prefix: '/terminal-socket',
    log: () => {},
  });
}
