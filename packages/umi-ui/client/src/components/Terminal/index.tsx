import { Row, Col, Spin } from 'antd';
import { Delete, Enter } from '@ant-design/icons';
import { Terminal as XTerminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import cls from 'classnames';
import React, { useRef, useEffect, useState } from 'react';
import { WebLinksAddon } from 'xterm-addon-web-links';
import useWindowSize from '@/components/hooks/useWindowSize';
import styles from './index.module.less';

const { Terminal } = window;

export interface ITerminalProps {
  className?: string;
  defaultValue?: string;
  getIns?: (ins: XTerminal) => void;
  terminalConfig?: object;
  [key: string]: any;
}

const TerminalComponent: React.FC<ITerminalProps> = (props = {}) => {
  const domContainer = useRef<HTMLDivElement>(null);
  const { className, defaultValue, getIns, terminalConfig = {} } = props;
  const [xterm, setXterm] = useState<XTerminal>(null);

  const size = useWindowSize();

  useEffect(() => {
    setXterm(
      new (Terminal as typeof XTerminal)({
        allowTransparency: true,
        fontSize: 14,
        theme: {
          background: '#15171C',
          foreground: '#ffffff73',
        },
        cursorBlink: false,
        cursorStyle: 'bar',
        disableStdin: true,
        ...terminalConfig,
      }),
    );
  }, []);

  useEffect(
    () => {
      if (domContainer.current && xterm) {
        xterm.loadAddon(new WebLinksAddon());
        xterm.open(domContainer.current);
        if (getIns) {
          getIns(xterm);
        }
        fit(xterm);
        if (defaultValue) {
          defaultValue.split('\n').forEach((msg: string) => {
            if (!msg) {
              return;
            }
            xterm.writeln(msg);
          });
        }
      }
    },
    [domContainer, xterm],
  );

  useEffect(
    () => {
      if (xterm) {
        fit(xterm);
      }
    },
    [size.width, size.height],
  );

  const clear = () => {
    if (xterm) {
      xterm.clear();
    }
  };

  const toBottom = () => {
    if (xterm) {
      xterm.scrollToBottom();
    }
  };

  const wrapperCls = cls(styles.wrapper, className);

  console.log('xterm', xterm, domContainer.current);

  return (
    <div className={wrapperCls}>
      {xterm ? (
        <Row className={styles.titleWrapper}>
          <Col span={8} className={styles.formmatGroup}>
            输出
          </Col>
          <Col span={4} offset={12} className={styles.actionGroup}>
            <Delete onClick={clear} />
            <Enter onClick={toBottom} />
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      )}
      <div ref={domContainer} className={styles.logContainer} />
    </div>
  );
};

export default TerminalComponent;
