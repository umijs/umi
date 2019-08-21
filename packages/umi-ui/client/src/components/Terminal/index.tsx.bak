import React, { useRef, useState, useEffect } from 'react';
import { Terminal as XTerminal } from 'xterm';
import cls from 'classnames';
import moment from 'moment';
import { fit } from 'xterm/lib/addons/fit/fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import Context from '@/layouts/Context';
import logConverter from './logConverter';
import xtermTheme from './theme';
import styles from './index.less';

const Terminal = require('xterm');

export interface IUiTerminal {
  className?: string;
  wrapperClassName?: string;
  write: (terminal: InstanceType<typeof XTerminal>) => void;
}

const UiTerminal: React.FC<IUiTerminal> = props => {
  const { write, wrapperClassName, className } = props;
  const { theme, setTheme } = React.useContext(Context);
  const [isInit, setInit] = useState(false);

  const xterm = new (Terminal as typeof XTerminal)({
    theme: xtermTheme[theme],
    cursorBlink: false,
    cursorStyle: 'bar',
    fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
    disableStdin: true,
  });

  xterm.loadAddon(new WebLinksAddon());

  const xtermRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (xtermRef.current) {
      if (!isInit) {
        xterm.open(xtermRef.current);
        fit(xterm);
        setInit(true);
      }
      // const BUFFER_LINES = 10;
      // xterm.scrollLines(logs.length + BUFFER_LINES);
      // xterm.writeln('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
      // xterm.writeln('https://umijs.org');
      xterm.writeln('');
      if (write) {
        write(xterm);
      }
      // logs.forEach(log => {
      //   const { type, date, message } = log;
      //   const typeFormat =
      //     type === 'error' ? logConverter.error(` ${type} `) : logConverter.info(` ${type} `);
      //   const formatDate = moment(date).isValid()
      //     ? moment(date).format('YYYY-MM-DD HH:mm:ss')
      //     : '';
      //   xterm.writeln(`${typeFormat} ${formatDate}: ${message}`);
      //   xterm.writeln('');
      // });
    }
    // xterm.on('key', (key, ev) => {
    //   if (key.charCodeAt(0) == 13) {
    //     xterm.write('\n');
    //   }
    //   xterm.write(key);
    // });
  }, []);

  const wrapCls = cls(styles.normal, wrapperClassName);
  const terminalCls = cls(styles.terminal, className);
  return (
    <div className={wrapCls}>
      <div className={terminalCls} ref={xtermRef} />
    </div>
  );
};

export default UiTerminal;
