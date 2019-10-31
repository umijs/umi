import * as React from 'react';
import cls from 'classnames';
import { formatDate, formatMessage } from 'umi-plugin-react/locale';
import { getLocale } from '@/utils/index';
import zhCN from '@/locales/zh-CN';
import enUS from '@/locales/en-US';
import Terminal, { TerminalType } from '@/components/Terminal';

import styles from './index.less';

interface ShellProps {
  style?: React.CSSProperties;
  className?: string;
}

const Shell: React.SFC<ShellProps> = (props, ref) => {
  const { style, className } = props;
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

  return (
    <div className={shellCls} style={style}>
      <Terminal
        onInit={(t, fitAddon) => {
          if (typeof ref === 'function') {
            ref(t, fitAddon);
          }
          setTerminalRef(t);
        }}
        toolbar={false}
        className={styles.terminalWrapper}
        terminalClassName={styles.terminal}
        shell
      />
    </div>
  );
};

export default React.forwardRef(Shell);
