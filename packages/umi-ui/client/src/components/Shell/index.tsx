import * as React from 'react';
import cls from 'classnames';
import { formatDate, formatMessage } from 'umi-plugin-react/locale';
import { getLocale } from '@/utils/index';
import zhCN from '@/locales/zh-CN';
import enUS from '@/locales/en-US';
import Terminal, { TerminalType } from '@/components/Terminal';

import styles from './index.less';

interface LogProps {
  logs?: object[];
  style?: React.CSSProperties;
  className?: string;
  type?: string;
}

const TAG_MAP = {
  error: {
    color: '#f04134',
  },
  info: {
    color: '#1890ff',
  },
};

const Logs: React.SFC<LogProps> = props => {
  const { style, className } = props;
  const logsCls = cls(styles.logs, className);
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
    <div className={logsCls} style={style}>
      <Terminal
        onInit={t => setTerminalRef(t)}
        toolbar={false}
        terminalClassName={styles.terminal}
        shell
      />
    </div>
  );
};

export default Logs;
