import { Row, Col, Spin, Tooltip, Popconfirm } from 'antd';
import { Delete, Enter } from '@ant-design/icons';
import { Terminal as XTerminal } from 'xterm';
import cls from 'classnames';
import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { IUi } from 'umi-types';
import { WebLinksAddon } from 'xterm-addon-web-links';
import intl from '@/utils/intl';
import useWindowSize from '@/components/hooks/useWindowSize';
import styles from './index.module.less';

const { Terminal } = window;

export type TerminalType = XTerminal;

const TerminalComponent: React.FC<IUi.ITerminalProps> = forwardRef((props = {}, ref) => {
  const domContainer = ref || useRef<HTMLDivElement>(null);
  const { title, className, defaultValue, onInit, config = {}, terminalClassName } = props;
  const [xterm, setXterm] = useState<XTerminal>(null);

  const size = useWindowSize();

  useEffect(() => {
    (Terminal as any).applyAddon(fit);
    const terminal = new (Terminal as typeof XTerminal)({
      allowTransparency: true,
      fontFamily: `operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace`,
      fontSize: 14,
      theme: {
        background: '#15171C',
        foreground: '#ffffff73',
      },
      cursorBlink: false,
      cursorStyle: 'underline',
      disableStdin: true,
      ...config,
    });
    setXterm(terminal);
  }, []);

  useEffect(
    () => {
      if (domContainer.current && xterm) {
        xterm.loadAddon(new WebLinksAddon());
        xterm.open(domContainer.current);
        if (xterm.fit) {
          xterm.fit();
        }
        if (onInit) {
          onInit(xterm);
        }
      }
    },
    [domContainer, xterm],
  );

  useEffect(
    () => {
      if (xterm && xterm.fit) {
        xterm.fit();
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
    [xterm],
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
            {title || intl({ id: 'org.umi.ui.global.log' })}
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
});

export default TerminalComponent;
