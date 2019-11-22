import * as React from 'react';
import { Popover, Drawer, Dropdown, Menu, Divider, Popconfirm, message, Tooltip } from 'antd';
import { Check as CheckIcon, Code as CodeIcon } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import get from 'lodash/get';
import {
  FolderFilled,
  ProfileFilled,
  HomeFilled,
  Tag as TagIcon,
  QuestionCircle,
  Message,
  Code,
} from '@ant-design/icons';
import { formatMessage } from 'umi-plugin-react/locale';
import cls from 'classnames';
import { LOCALES, LOCALES_ICON } from '@/enums';
import Context from '@/layouts/Context';
import Logs from '@/components/Logs';
import FooterToolbar from './FooterToolbar';
import Shell from '@/components/Shell';
import { states, reducers } from '@/customModels/footer';
import { handleBack } from '@/utils';
import event, { MESSAGES } from '@/message';
import { getHistory, listenMessage, clearLog } from '@/services/logs';
import { openInEditor } from '@/services/project';
import getAnalyze from '@/getAnalyze';

import styles from './Footer.less';

const { useEffect, useReducer, useContext } = React;

type IPanel = 'log' | 'terminal';

export interface IFooterProps {
  type: 'list' | 'detail' | 'loading';
}

const Footer: React.SFC<IFooterProps> = props => {
  const { type } = props;
  const { locale, setLocale, currentProject, isMini, basicUI } = useContext(Context);
  const drawerContainerRef = React.createRef();
  const { path, name, key } = currentProject || {};
  const { gtag } = getAnalyze();
  const [{ logs, terminal, fitAddon, terminalHeight, logHeight, visible }, dispatch] = useReducer(
    (state, action) => reducers[action.type](state, action),
    states,
  );

  const handleOpenEditor = async () => {
    if (key) {
      await openInEditor({
        key,
      });
      gtag('event', 'click_footer', {
        event_category: 'openEditor',
      });
    }
  };

  const togglePanel = (panel: IPanel) => {
    dispatch({
      type: 'togglePanel',
      payload: {
        panel,
      },
    });
    gtag('event', 'click_footer', {
      event_category: panel,
      event_label: !!visible[panel],
    });
  };

  const getLogs = async () => {
    const { data: historyLogs } = await getHistory();
    dispatch({
      type: 'setHistory',
      payload: {
        logs: historyLogs,
      },
    });
  };

  // debounce will lead alert in Firefox
  const handleCopyPath = (p: string) => {
    if (p) {
      try {
        copy(p || '');
        message.success(formatMessage({ id: 'org.umi.ui.global.copy.success' }));
      } catch (e) {
        message.error(formatMessage({ id: 'org.umi.ui.global.copy.failure' }));
      }
    }
  };

  useEffect(() => {
    (async () => {
      await getLogs();
      listenMessage({
        onMessage(log) {
          dispatch({
            type: 'add',
            payload: {
              logs: log,
            },
          });
        },
      });
    })();

    event.on(MESSAGES.SHOW_LOG, (panel: IPanel) => {
      togglePanel(panel || 'log');
    });
    event.on(MESSAGES.HIDE_LOG, (panel: IPanel) => {
      togglePanel(panel || 'log');
    });
    return () => {
      event.off(MESSAGES.SHOW_LOG, (panel: IPanel) => {
        togglePanel(panel || 'log');
      });
      event.off(MESSAGES.HIDE_LOG, (panel: IPanel) => {
        togglePanel(panel || 'log');
      });
    };
  }, []);

  const actionCls = cls(styles.section, styles.action);
  const logCls = cls(actionCls, styles.log);
  const shellCls = cls(actionCls, styles.shell);

  const LocaleText = ({ locale: textLocale, checked, style }) => (
    <span style={style}>
      {typeof checked !== 'undefined' && (
        <CheckIcon style={{ marginRight: 8, opacity: checked ? 1 : 0 }} />
      )}
      {LOCALES_ICON[textLocale]} {LOCALES[textLocale]}
    </span>
  );

  const menu = (
    <Menu
      theme="dark"
      onClick={({ key }) => {
        setLocale(key, type === 'loading');
      }}
    >
      {Object.keys(LOCALES).map((lang: any) => (
        <Menu.Item className={`ui-locale-${lang}`} key={lang}>
          <LocaleText locale={lang} checked={locale === lang} />
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleClearLog = async () => {
    try {
      await clearLog();
    } catch (e) {
      message.error(formatMessage({ id: 'org.umi.ui.global.log.clear.error' }));
    } finally {
      await getLogs();
    }
  };

  const handleScorllBottom = () => {
    const container = document.getElementById('ui-footer-logs');
    if (container) {
      container.scrollIntoView({ block: 'end' });
    }
  };

  const feedback = basicUI.feedback || {
    width: 230,
    height: 150,
    src: '//img.alicdn.com/tfs/TB1n__6eFP7gK0jSZFjXXc5aXXa-737-479.png',
  };

  const helpDoc = basicUI.helpDoc || {
    'zh-CN': 'https://umijs.org/zh/guide/umi-ui.html',
    'en-US': 'https://umijs.org/guide/umi-ui.html',
  };
  const projectDashboard = type !== 'list' && path && name;

  return (
    <div className={styles.footer}>
      <div ref={drawerContainerRef} className={styles['section-drawer-container']}>
        <Drawer
          title={
            <FooterToolbar
              resizeAxis="y"
              onResize={size => {
                const newHeight = logHeight + size.deltaY;
                dispatch({
                  type: 'changeSize',
                  payload: {
                    logHeight: newHeight,
                  },
                });
              }}
              onClear={handleClearLog}
              onScrollBottom={handleScorllBottom}
              onClose={() => togglePanel('log')}
            />
          }
          getContainer={drawerContainerRef.current}
          closable={false}
          visible={visible.log}
          placement="bottom"
          mask={false}
          className={styles['section-drawer']}
          height={logHeight}
        >
          <Logs logs={logs} type={type} className={styles['section-drawer-logs']} />
        </Drawer>
        <Drawer
          title={
            <FooterToolbar
              resizeAxis="y"
              onResize={size => {
                const newHeight = terminalHeight + size.deltaY;
                dispatch({
                  type: 'changeSize',
                  payload: {
                    terminalHeight: newHeight,
                  },
                });
                if (fitAddon) {
                  fitAddon.fit();
                }
              }}
              onClose={() => togglePanel('terminal')}
              onClear={() => terminal.clear()}
              onScrollBottom={() => terminal.scrollToBottom()}
            />
          }
          getContainer={drawerContainerRef.current}
          destroyOnClose={false}
          closable={false}
          visible={visible.terminal}
          placement="bottom"
          mask={false}
          className={styles['section-drawer']}
          height={terminalHeight}
        >
          {typeof visible.terminal === 'boolean' && (
            // init shell socket when open Drawer
            <Shell
              // style hide / show, not dom
              visible={!!visible.terminal}
              ref={(ref, fitAddon) =>
                dispatch({
                  type: 'initTerminal',
                  payload: {
                    terminal: ref,
                    fitAddon,
                  },
                })
              }
              className={styles['section-drawer-shell']}
            />
          )}
        </Drawer>
      </div>
      <div className={styles.statusBar}>
        <div className={styles['statusBar-left']}>
          {!isMini && (
            <div
              onClick={() => {
                handleBack(type === 'loading');
              }}
              className={actionCls}
            >
              <Tooltip title={formatMessage({ id: 'org.umi.ui.global.home' })}>
                <HomeFilled style={{ marginRight: 4 }} />
              </Tooltip>
            </div>
          )}
          {projectDashboard && (
            <>
              <div className={actionCls} onClick={() => handleCopyPath(path)}>
                <FolderFilled style={{ marginRight: 4 }} /> {path}
              </div>
            </>
          )}
          <div onClick={() => togglePanel('log')} className={logCls}>
            <ProfileFilled style={{ marginRight: 4 }} />{' '}
            {formatMessage({ id: 'org.umi.ui.global.log' })}
          </div>
          {projectDashboard && (
            <div className={shellCls} onClick={() => togglePanel('terminal')}>
              <Code style={{ marginRight: 4 }} />{' '}
              {formatMessage({ id: 'org.umi.ui.global.terminal' })}
            </div>
          )}
        </div>

        {type === 'detail' && (
          <div className={styles.section}>
            <a onClick={handleOpenEditor}>
              <CodeIcon style={{ marginRight: 4 }} />{' '}
              {formatMessage({ id: 'org.umi.ui.global.open.editor' })}
            </a>
          </div>
        )}

        <div className={styles.section}>
          {/* TODO: register with framework, bigfish use office network */}
          <Popover
            title={null}
            placement="top"
            overlayClassName={styles.help}
            content={
              <div className={styles.feedback}>
                <img {...feedback} />
              </div>
            }
          >
            <a>
              <Message style={{ marginRight: 4 }} />{' '}
              {type === 'loading'
                ? formatMessage({ id: 'org.umi.ui.global.feedback' })
                : formatMessage({ id: 'org.umi.ui.global.feedback' })}
            </a>
          </Popover>
        </div>

        <div className={styles.section}>
          <a
            href={typeof helpDoc === 'object' ? helpDoc[window.g_lang] : helpDoc}
            target="_blank"
            rel="noopener noreferrer"
          >
            <QuestionCircle style={{ marginRight: 4 }} />{' '}
            {formatMessage({ id: 'org.umi.ui.global.help' })}
          </a>
        </div>
        <div data-test-id="locale_wrapper" className={styles.section} style={{ cursor: 'pointer' }}>
          <Dropdown overlay={menu} placement="topCenter">
            <p>
              <LocaleText locale={locale} />
              {/* <span style={{ marginLeft: 8 }}>
                <Swap />
              </span> */}
            </p>
          </Dropdown>
        </div>
        <div className={styles.version}>
          <span>
            <TagIcon style={{ marginRight: 4 }} />
            {window.g_bigfish ? get(window, 'g_bigfish.version') : get(window, 'g_umi.version')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
