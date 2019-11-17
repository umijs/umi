import * as React from 'react';
import cls from 'classnames';
import SockJS from 'sockjs-client';
import request from 'umi-request';
import { AttachAddon } from 'xterm-addon-attach';
import Terminal, { TerminalType } from '@/components/Terminal';

import styles from './index.less';

interface ShellProps {
  style?: React.CSSProperties;
  visible?: boolean;
  className?: string;
}

const Shell: React.SFC<ShellProps> = (props, ref) => {
  const { style, className, visible } = props;
  const shellCls = cls(styles.shell, className);
  const [terminalRef, setTerminalRef] = React.useState<TerminalType>(null);

  React.useEffect(
    () => {
      if (terminalRef) {
        terminalRef.prompt = () => {
          terminalRef.write('\r\n$ ');
        };
      }
    },
    [terminalRef],
  );

  const handleInit = async (xterm, fitAddon) => {
    if (typeof ref === 'function') {
      ref(xterm, fitAddon);
    }
    setTerminalRef(xterm);
    // init /terminal socket server
    const { rows, cols } = xterm;
    await request(`/terminal?rows=${rows}&cols=${cols}`);
    const socket = new SockJS('/terminal-socket');
    xterm.loadAddon(new AttachAddon(socket));
    xterm.focus();
  };

  const handleResize = async xterm => {
    const { rows, cols } = xterm;
    try {
      await request(`/terminal/resize?rows=${rows}&cols=${cols}`);
    } catch (e) {
      console.error('resize Terminal error', e);
    }
  };

  return (
    <div className={shellCls} style={style}>
      <Terminal
        config={{
          cursorBlink: true,
          disableStdin: false,
        }}
        onInit={handleInit}
        onResize={handleResize}
        visible={visible}
        toolbar={false}
        className={styles.terminalWrapper}
        terminalClassName={styles.terminal}
      />
    </div>
  );
};

export default React.forwardRef(Shell);
