import { Row, Col, Spin, Tooltip, Popconfirm } from 'antd';
import { Delete, Enter } from '@ant-design/icons';
import { Terminal as XTerminal, ITerminalOptions } from 'xterm';
import cls from 'classnames';
import SockJS from 'sockjs-client';
import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { IUi } from 'umi-types';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import intl from '@/utils/intl';
import useWindowSize from '@/components/hooks/useWindowSize';
import styles from './index.module.less';

const { Terminal } = window;

export type TerminalType = XTerminal;

const TerminalComponent: React.FC<IUi.ITerminalProps> = forwardRef((props = {}, ref) => {
  const domContainer = ref || useRef<HTMLDivElement>(null);
  const {
    title,
    className,
    defaultValue,
    onInit,
    config = {},
    terminalClassName,
    shell = false,
    toolbar = true,
  } = props;
  const [xterm, setXterm] = useState<XTerminal>(null);

  const size = useWindowSize();

  useEffect(() => {
    const terminalOpts: ITerminalOptions = {
      allowTransparency: true,
      fontFamily: 'operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
      fontSize: 14,
      theme: {
        background: '#15171C',
        foreground: '#ffffff73',
      },
      cursorStyle: 'underline',
      // if use shell, disable
      cursorBlink: !shell,
      disableStdin: !shell,
      ...(config || {}),
    };
    const terminal = new Terminal(terminalOpts);
    setXterm(terminal);
  }, []);

  const copyShortcut = (e: KeyboardEvent): boolean => {
    // Ctrl + Shift + C
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
      document.execCommand('copy');
      return false;
    }
    return true;
  };

  useEffect(
    () => {
      let socket: any;
      if (domContainer.current && xterm) {
        if (onInit) {
          onInit(xterm);
        }
        xterm.open(domContainer.current);
        xterm.loadAddon(new FitAddon());
        xterm.loadAddon(new WebLinksAddon());
        xterm.attachCustomKeyEventHandler(copyShortcut);
        if (shell) {
          socket = new SockJS('/terminal');
          xterm.loadAddon(new AttachAddon(socket));
          xterm.focus();
        }
      }
      return () => {
        if (socket) {
          xterm.detach(socket);
        }
        if (xterm) {
          xterm.dispose();
        }
      };
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

  const wrapperCls = cls(
    styles.wrapper,
    {
      [styles.toolbar]: !!toolbar,
    },
    className,
  );
  const terminalCls = cls(styles.logContainer, terminalClassName);

  return (
    <div className={wrapperCls}>
      {xterm ? (
        <>
          {toolbar && (
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
          )}
        </>
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
