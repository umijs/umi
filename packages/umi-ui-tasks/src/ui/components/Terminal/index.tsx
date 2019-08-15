import { Terminal } from 'xterm';
import React, { useRef, useState, useEffect } from 'react';
import { useTerminal } from '../../hooks';
import styles from './index.module.less';

export interface IProps {
  terminal: Terminal;
}

const TerminalComponent: React.FC<IProps> = ({ terminal }) => {
  const domContainer = useRef();
  const [, setInit] = useState(false);
  useEffect(() => {
    setInit(true);
  }, []);
  useTerminal({ terminal, ref: domContainer.current });

  const clear = () => {
    terminal.clear();
  };

  const toBottom = () => {
    terminal.scrollToBottom();
  };

  return (
    <div>
      <div className={styles.actionContainer}>
        <div className={styles.titleWrapper}>
          <span>日志</span>
        </div>
        <div className={styles.actionWrapper}>
          <span onClick={clear}>清除</span>
          <span onClick={toBottom}>至底部</span>
        </div>
      </div>
      <div ref={domContainer} className={styles.logContainer} />
    </div>
  );
};

export default TerminalComponent;
