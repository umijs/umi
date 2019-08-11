import React, { useRef, useState, useEffect } from 'react';
import { Terminal as XTerminal } from 'xterm';
import moment from 'moment';
import { fit } from 'xterm/lib/addons/fit/fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import Context from '@/layouts/Context';
import logConverter from './logConverter';
import xtermTheme from './theme';
import styles from './index.less';

const Terminal = require('xterm');

export default props => {
  const { logs = [] } = props;
  const { theme, setTheme } = React.useContext(Context);
  const [isInit, setInit] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const xterm = new (Terminal as typeof XTerminal)({
    theme: xtermTheme[theme],
    cursorBlink: false,
    cursorStyle: 'bar',
    fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
    disableStdin: true,
  });

  xterm.loadAddon(new WebLinksAddon());

  const xtermRef = useRef<HTMLDivElement>();

  useEffect(
    () => {
      if (xtermRef.current) {
        if (!isInit) {
          xterm.open(xtermRef.current);
          fit(xterm);
        }
        console.log('logs', logs);
        // const BUFFER_LINES = 10;
        // xterm.scrollLines(logs.length + BUFFER_LINES);
        // xterm.writeln('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
        // xterm.writeln('https://umijs.org');
        xterm.writeln('');
        logs.forEach(log => {
          const { type, date, message } = log;
          const typeFormat =
            type === 'error' ? logConverter.error(` ${type} `) : logConverter.info(` ${type} `);
          const formatDate = moment(date).isValid()
            ? moment(date).format('YYYY-MM-DD HH:mm:ss')
            : '';
          xterm.writeln(`${typeFormat} ${formatDate}: ${message}`);
          xterm.writeln('');
        });
      }
      // xterm.on('key', (key, ev) => {
      //   if (key.charCodeAt(0) == 13) {
      //     xterm.write('\n');
      //   }
      //   xterm.write(key);
      // });
    },
    [minimized, logs.length],
  );

  // function initXTerm() {
  //   xterm.open(containerEl.current);
  //   xterm.write(logs);
  // }

  // function handleLink(e, uri) {
  //   window.open(uri, '_blank');
  // }

  // function fit() {
  //   xterm.element.style.display = 'none';
  //   setTimeout(() => {
  //     xterm.fit();
  //     xterm.element.style.display = '';
  //     xterm.refresh(0, xterm.rows - 1);
  //   });
  // }

  // function minimize() {
  //   setMinimized(true);
  // }

  // function maximize() {
  //   setMinimized(false);
  // }

  return (
    <div className={`${styles.normal} ${minimized ? styles.minimize : ''}`}>
      {/* <div className={styles.header}> */}
      {/*  Terminal */}
      {/*  <button onClick={fit}>fit</button> */}
      {/*  <button onClick={minimize}>minimize</button> */}
      {/*  <button onClick={maximize}>maximize</button> */}
      {/* </div> */}
      {/* <ul>
        {logs.map(log => (
          <li>
            [{log.type}]-[{log.date}]: {log.message}
          </li>
        ))}
      </ul> */}
      <div className={styles.terminal} ref={xtermRef} />
    </div>
  );
};
