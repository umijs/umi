import { Row, Col, Tooltip } from 'antd';
import { Delete, Enter } from '@ant-design/icons';
import { Terminal } from 'xterm';
import React, { useRef, useState, useEffect } from 'react';
import { useTerminal, usePrevious } from '../../hooks';
import styles from './index.module.less';
import { IUiApi } from 'umi-types';

export interface IProps {
  api: IUiApi;
  terminal: Terminal;
  log?: string;
  onClear?: any;
  size?: any;
}

const TerminalComponent: React.FC<IProps> = ({ terminal, log, onClear, size = {}, api }) => {
  const { intl } = api;
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
      return () => {
        terminal.clear();
      };
    },
    [log],
  );

  // mount or updated
  const prevSize = usePrevious(size);
  useEffect(
    () => {
      if (prevSize) {
        if (prevSize.width !== size.width || prevSize.height !== size.height) {
          terminal.fit();
        }
      }
    },
    [size.width, size.height],
  );

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
          {intl({ id: 'org.umi.ui.tasks.log.title' })}
        </Col>
        <Col span={4} offset={12} className={styles.actionGroup}>
          <span className={styles.icon}>
            <Tooltip title={intl({ id: 'org.umi.ui.tasks.terminal.clear' })}>
              <Delete onClick={clear} />
            </Tooltip>
          </span>
          <span className={styles.icon}>
            <Tooltip title={intl({ id: 'org.umi.ui.tasks.terminal.bottom' })}>
              <Enter onClick={toBottom} />
            </Tooltip>
          </span>
        </Col>
      </Row>
      <div ref={domContainer} className={styles.logContainer} />
    </div>
  );
};

export default TerminalComponent;
