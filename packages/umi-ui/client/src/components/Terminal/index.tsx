import { Row, Col } from 'antd';
import { Delete, Enter } from '@ant-design/icons';
import { Terminal as XTerminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import React, { useRef, useState, useEffect } from 'react';
import { WebLinksAddon } from 'xterm-addon-web-links';
import styles from './index.module.less';

const { Terminal } = window;

export interface IProps {
  log?: string;
  onClear?: any;
  getTerminalIns?: (ref: typeof XTerminal) => void;
}

const TerminalComponent: React.FC<IProps> = ({ log, onClear, getTerminalIns }) => {
  let term: typeof XTerminal = null;
  const domContainer = useRef<HTMLDivElement>();

  useEffect(
    () => {
      if (domContainer.current) {
        term = new (Terminal as typeof XTerminal)({
          allowTransparency: true,
          theme: {
            background: '#15171C',
            foreground: '#ffffff73',
          },
          cursorBlink: false,
          cursorStyle: 'bar',
          disableStdin: true,
        });
        if (getTerminalIns) {
          getTerminalIns(term);
        }
        term.loadAddon(new WebLinksAddon());
        term.open(domContainer.current);
        fit(term);

        if (log) {
          log.split('\n').forEach((msg: string) => {
            term.writeln(msg);
          });
        }
      }
    },
    [log, domContainer],
  );

  const clear = () => {
    term.clear();
    if (onClear) {
      onClear();
    }
  };

  const toBottom = () => {
    term.scrollToBottom();
  };

  console.log('terminal', term);

  return (
    <div className={styles.wrapper}>
      <Row className={styles.titleWrapper}>
        <Col span={8} className={styles.formmatGroup}>
          输出
        </Col>
        <Col span={4} offset={12} className={styles.actionGroup}>
          <Delete onClick={clear} />
          <Enter onClick={toBottom} />
        </Col>
      </Row>
      <div ref={domContainer} className={styles.logContainer} />
    </div>
  );
};

export default TerminalComponent;
