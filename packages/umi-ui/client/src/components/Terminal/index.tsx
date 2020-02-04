import { Row, Col, Spin, Tooltip, Popconfirm } from 'antd';
import { DeleteOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Terminal as XTerminal, ITerminalOptions } from 'xterm';
import cls from 'classnames';
import debounce from 'lodash/debounce';
import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { IUi } from 'umi-types';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { FitAddon } from 'xterm-addon-fit';
import intl from '@/utils/intl';
import styles from './index.module.less';

const { Terminal } = window;

export type TerminalType = XTerminal;

const TerminalComponent: React.FC<IUi.ITerminalProps> = forwardRef((props = {}, ref) => {
  const fitAddon = new FitAddon();
  const domContainer = ref || useRef<HTMLDivElement>(null);
  const {
    title,
    className,
    defaultValue,
    onInit,
    config = {},
    terminalClassName,
    onResize = () => {},
    // default use true
    visible = true,
    toolbar = true,
  } = props;
  const [xterm, setXterm] = useState<XTerminal>(null);

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
      cursorBlink: false,
      disableStdin: true,
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

  useEffect(() => {
    const handleTerminalInit = async () => {
      if (domContainer.current && xterm) {
        const webLinksAddon = new WebLinksAddon();
        xterm.loadAddon(fitAddon);
        xterm.loadAddon(webLinksAddon);
        xterm.attachCustomKeyEventHandler(copyShortcut);
        // last open
        xterm.open(domContainer.current);
        fitAddon.fit();
        if (onInit) {
          onInit(xterm, fitAddon);
        }
      }
    };
    handleTerminalInit();
  }, [domContainer, xterm]);

  useEffect(() => {
    const hanldeResizeTerminal = debounce(() => {
      fitAddon.fit();
      onResize?.(xterm);
      xterm?.focus?.();
    }, 380);
    if (visible) {
      window.addEventListener('resize', hanldeResizeTerminal);
    }
    return () => {
      window.removeEventListener('resize', hanldeResizeTerminal);
    };
  }, [xterm, visible]);

  useEffect(() => {
    if (defaultValue) {
      xterm?.write?.(defaultValue.replace(/\n/g, '\r\n'));
    }
  }, [xterm, defaultValue]);

  const clear = () => {
    xterm?.clear?.();
  };

  const toBottom = () => {
    xterm?.scrollToBottom?.();
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
                      <DeleteOutlined />
                    </Tooltip>
                  </Popconfirm>
                </span>
                <span className={styles.icon}>
                  <Tooltip title={intl({ id: 'org.umi.ui.global.log.enter.tooltip' })}>
                    <VerticalAlignBottomOutlined onClick={toBottom} />
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
