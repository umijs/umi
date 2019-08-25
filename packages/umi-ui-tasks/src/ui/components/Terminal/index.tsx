import { Row, Col, Icon } from 'antd';
import { Terminal } from 'xterm';
import React, { useRef, useState, useEffect } from 'react';
import { useTerminal, usePrevious } from '../../hooks';
import styles from './index.module.less';

export interface IProps {
  terminal: Terminal;
  log?: string;
  onClear?: any;
  size?: any;
}

const TerminalComponent: React.FC<IProps> = ({ terminal, log, onClear, size }) => {
  const domContainer = useRef();
  const [, setInit] = useState(false);
  useEffect(() => {
    setInit(true);
  }, []);
  useTerminal({ terminal, ref: domContainer.current });
  useEffect(
    () => {
      if (log) {
        terminal.write(log.replace(/\n/g, '\r\n'));
      }
    },
    [log],
  );

  // mount or updated
  const prevSize = usePrevious(size);
  useEffect(() => {
    if (prevSize) {
      if (prevSize.width !== size.width || prevSize.height !== size.height) {
        terminal.fit();
        console.log(terminal.fit);
      }
    }
  });

  const clear = () => {
    terminal.clear();
    onClear && onClear();
  };

  const toBottom = () => {
    terminal.scrollToBottom();
  };

  return (
    <div className={styles.wrapper}>
      <Row className={styles.titleWrapper}>
        <Col span={8} className={styles.formmatGroup}>
          输出
        </Col>
        <Col span={4} offset={12} className={styles.actionGroup}>
          <Icon onClick={clear} type="delete" />
          <Icon onClick={toBottom} type="enter" />
        </Col>
      </Row>
      <div ref={domContainer} className={styles.logContainer} />
    </div>
  );
};

export default TerminalComponent;
