import sockjs, { Connection } from 'sockjs';
import { spawn } from 'node-pty';
// umiui:UmiUI:terminal
import { debugTerminal as _log } from './debug';

export interface IOpts {
  cwd: string;
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

export const connectionHandler = (conn: Connection, opts: IOpts) => {
  /**
   * send data into client
   * @param data
   */
  const send = (data: string) => {
    conn.write(data);
  };

  const { cwd } = opts;
  const defaultShell = getDefaultShell();
  const defaultShellArgs = ['--login'];
  const pty = spawn(defaultShell, defaultShellArgs, {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd,
    env: process.env,
  });

  /**
   * stringify command shell string
   * @param command ls/... shell commands
   */
  const ptySend = (command: string) => pty.write(`${command}\r`);

  conn.on('data', data => {
    _log('terminal conn data', data);
    ptySend(data);
  });

  pty.on('data', data => {
    _log('ptyProcess data', data);
    send(data);
  });

  pty.resize(100, 40);
};

/**
 * export terminal socket init needs bind express app server
 */
export default (app, opts: IOpts = { cwd: process.cwd() }) => {
  const terminalSS = sockjs.createServer();
  terminalSS.on('connection', conn => connectionHandler(conn, opts));
  terminalSS.installHandlers(app, {
    prefix: '/terminal',
    log: () => {},
  });
};
