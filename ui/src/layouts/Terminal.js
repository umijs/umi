import { useRef, useState, useEffect } from 'react';
import { Terminal } from 'xterm';
import 'xterm/dist/xterm.css';
import * as fit from 'xterm/dist/addons/fit/fit';
import * as webLinks from 'xterm/dist/addons/webLinks/webLinks';
import styles from './Terminal.less';

Terminal.applyAddon(fit);
Terminal.applyAddon(webLinks);

const defaultTheme = {
  foreground: '#2c3e50',
  background: '#fff',
  cursor: 'rgba(0, 0, 0, .4)',
  selection: 'rgba(0, 0, 0, 0.3)',
  black: '#000000',
  red: '#e83030',
  brightRed: '#e83030',
  green: '#42b983',
  brightGreen: '#42b983',
  brightYellow: '#ea6e00',
  yellow: '#ea6e00',
  magenta: '#e83030',
  brightMagenta: '#e83030',
  cyan: '#03c2e6',
  brightBlue: '#03c2e6',
  brightCyan: '#03c2e6',
  blue: '#03c2e6',
  white: '#d0d0d0',
  brightBlack: '#808080',
  brightWhite: '#ffffff',
};

const darkTheme = {
  ...defaultTheme,
  foreground: '#fff',
  background: '#1d2935',
  cursor: 'rgba(255, 255, 255, .4)',
  selection: 'rgba(255, 255, 255, 0.3)',
  magenta: '#e83030',
  brightMagenta: '#e83030',
};

export default function() {
  const [minimized, setMinimized] = useState(false);
  const containerEl = useRef(null);
  const xterm = new Terminal({
    theme: darkTheme,
  });
  window.xterm = xterm;

  webLinks.webLinksInit(xterm, handleLink);

  useEffect(
    () => {
      initXTerm();
    },
    [minimized],
  );

  function initXTerm() {
    xterm.open(containerEl.current);
    xterm.write('\x1b[32m$\x1b[0m aaa\r\n');
    xterm.write('\x1b[32m$\x1b[0m aaa\r\n');
    xterm.write('\x1b[32m$\x1b[0m https://umijs.org/\r\n');
    xterm.write('\x1b[32m$\x1b[0m aaa\r\n');
  }

  function handleLink(e, uri) {
    window.open(uri, '_blank');
  }

  function fit() {
    xterm.element.style.display = 'none';
    setTimeout(() => {
      xterm.fit();
      xterm.element.style.display = '';
      xterm.refresh(0, xterm.rows - 1);
    });
  }

  function minimize() {
    setMinimized(true);
  }

  function maximize() {
    setMinimized(false);
  }

  return (
    <div className={`${styles.normal} ${minimized ? styles.minimize : ''}`}>
      <div className={styles.header}>
        Terminal
        <button onClick={fit}>fit</button>
        <button onClick={minimize}>minimize</button>
        <button onClick={maximize}>maximize</button>
      </div>
      <div className={styles.main} ref={containerEl} />
    </div>
  );
}
