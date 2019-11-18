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

let socket: any;

const Shell: React.SFC<ShellProps> = (props, ref) => {
  const { style, className, visible } = props;
  const shellCls = cls(styles.shell, className);
  const [terminalRef, setTerminalRef] = React.useState();

  const handleInit = async (xterm, fitAddon) => {
    if (typeof ref === 'function') {
      ref(xterm, fitAddon);
    }
    if (!socket) {
      socket = new SockJS('/terminal-socket');
      xterm.loadAddon(new AttachAddon(socket));
      xterm.focus();
      await handleResize(xterm);
    }
    setTerminalRef(xterm);
  };

  const handleResize = async xterm => {
    const { rows, cols } = xterm;
    try {
      await request(`/terminal/resize?rows=${rows}&cols=${cols}`);
    } catch (e) {
      console.error('resize Terminal error', e);
    }
  };

  React.useEffect(
    () => {
      if (visible && terminalRef) {
        terminalRef.focus();
      }
    },
    [visible],
  );

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
