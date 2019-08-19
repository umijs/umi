import { Row, Col, Icon } from 'antd';
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
