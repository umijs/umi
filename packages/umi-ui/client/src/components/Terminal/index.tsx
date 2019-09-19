import { Row, Col, Spin, Tooltip, Popconfirm } from 'antd';
import { Delete, Enter } from '@ant-design/icons';
import { Terminal as XTerminal } from 'xterm';
import { fit } from 'xterm/lib/addons/fit/fit';
import cls from 'classnames';
import React, { useRef, useEffect, useState } from 'react';
import { WebLinksAddon } from 'xterm-addon-web-links';
import intl from '@/utils/intl';
import useWindowSize from '@/components/hooks/useWindowSize';
import styles from './index.module.less';

const { Terminal } = window;

export interface ITerminalProps {
  className?: string;
  terminalClassName?: string;
  defaultValue?: string;
  getIns?: (ins: XTerminal) => void;
  terminalConfig?: object;
  [key: string]: any;
}

const TerminalComponent: React.FC<ITerminalProps> = (props = {}) => {
  const domContainer = useRef<HTMLDivElement>(null);
  const { className, defaultValue, getIns, terminalConfig = {}, terminalClassName } = props;
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
        cursorStyle: 'underline',
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

  useEffect(
    () => {
      if (xterm && defaultValue) {
        xterm.write(defaultValue.replace(/\n/g, '\r\n'));
      }
    },
    [defaultValue, xterm],
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
  const terminalCls = cls(styles.logContainer, terminalClassName);

  return (
    <div className={wrapperCls}>
      {xterm ? (
        <Row className={styles.titleWrapper}>
          <Col span={8} className={styles.formmatGroup}>
            {intl({
              id: 'org.umi.ui.global.log',
            })}
          </Col>
          <Col span={4} offset={12} className={styles.actionGroup}>
            <span className={styles.icon}>
              <Popconfirm
                title={intl({ id: 'org.umi.ui.global.log.clear.confirm' })}
                onConfirm={clear}
              >
                <Tooltip title={intl({ id: 'org.umi.ui.global.log.clear.tooltip' })}>
                  <Delete />
                </Tooltip>
              </Popconfirm>
            </span>
            <span className={styles.icon}>
              <Tooltip title={intl({ id: 'org.umi.ui.global.log.enter.tooltip' })}>
                <Enter onClick={toBottom} />
              </Tooltip>
            </span>
          </Col>
        </Row>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      )}
      <div ref={domContainer} className={terminalCls} />
    </div>
  );
};

export default TerminalComponent;
