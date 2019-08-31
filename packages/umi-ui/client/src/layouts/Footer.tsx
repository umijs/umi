import * as React from 'react';
import { Popover, Drawer, Dropdown, Menu, Divider, Popconfirm, message, Tooltip } from 'antd';
import { Check as CheckIcon } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import debounce from 'lodash/debounce';
import {
  FolderFilled,
  ProfileFilled,
  HomeFilled,
  QuestionCircle,
  Message,
  Close,
  Enter,
  Delete,
} from '@ant-design/icons';
import { formatMessage } from 'umi-plugin-react/locale';
import cls from 'classnames';
import history from '@tmp/history';
import omit from 'lodash/omit';
import { LOCALES, LOCALES_ICON } from '@/enums';
import intl from '@/utils/intl';
import Context from '@/layouts/Context';
import Logs from '@/components/Logs';
import { handleBack } from '@/utils';
import { getHistory, listenMessage, clearLog } from '@/services/logs';

import styles from './Footer.less';

const { useState, useEffect, useReducer, useContext } = React;

export interface IFooterProps {
  type: 'list' | 'detail' | 'loading';
}

const FOOTER_RIGHT = [
  {
    title: 'org.umi.ui.global.help',
    icon: <QuestionCircle />,
    href: 'https://umijs.org',
  },
];

const Footer: React.SFC<IFooterProps> = props => {
  const { type } = props;
  const { locale, setLocale, currentProject } = useContext(Context);
  const { path, name } = currentProject || {};
  const [logVisible, setLogVisible] = useState<boolean>(false);
  const [logs, dispatch] = useReducer((state, action) => {
    if (action.type === 'add') {
      return [...state, action.payload];
    }
    if (action.type === 'setHistory') {
      return action.payload;
    }
  }, []);

  const showLogPanel = () => {
    setLogVisible(true);
  };

  const hideLogPanel = () => {
    setLogVisible(false);
  };

  const redirect = (url: string) => {
    history.push(url);
  };

  const getLogs = async () => {
    const { data: historyLogs } = await getHistory();
    dispatch({
      type: 'setHistory',
      payload: historyLogs,
    });
  };

  const handleCopyPathDebounce = debounce((p: string) => {
    if (p) {
      try {
        copy(p);
        message.success(intl({ id: 'org.umi.ui.global.copy.success' }));
      } catch (e) {
        message.error(intl({ id: 'org.umi.ui.global.copy.failure' }));
      }
    }
  }, 300);

  useEffect(() => {
    (async () => {
      await getLogs();
      listenMessage({
        onMessage(log) {
          dispatch({
            type: 'add',
            payload: log,
          });
        },
      });
    })();

    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.on('SHOW_LOG', () => {
        setLogVisible(true);
      });
      window.g_uiEventEmitter.on('HIDE_LOG', () => {
        setLogVisible(false);
      });
    }
    return () => {
      if (window.g_uiEventEmitter) {
        window.g_uiEventEmitter.removeListener('SHOW_LOG', () => {});
        window.g_uiEventEmitter.removeListener('HIDE_LOG', () => {});
      }
      handleCopyPathDebounce.cancel();
    };
  }, []);

  const actionCls = cls(styles.section, styles.action);
  const logCls = cls(actionCls, styles.log);

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
        <Menu.Item key={lang}>
          <LocaleText locale={lang} checked={locale === lang} />
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleClearLog = async () => {
    try {
      await clearLog();
    } catch (e) {
      message.error(intl({ id: 'org.umi.ui.global.log.clear.error' }));
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

  return (
    <div className={styles.footer}>
      <div className={styles.statusBar}>
        <div
          onClick={() => {
            handleBack(type === 'loading');
          }}
          className={actionCls}
        >
          <Tooltip title={intl({ id: 'org.umi.ui.global.home' })}>
            <HomeFilled style={{ marginRight: 4 }} />
          </Tooltip>
        </div>
        {path && name && (
          <>
            <div className={actionCls} onClick={() => handleCopyPathDebounce(path)}>
              <FolderFilled style={{ marginRight: 4 }} /> {path}
            </div>
          </>
        )}
        <div onClick={() => (logVisible ? hideLogPanel() : showLogPanel())} className={logCls}>
          <ProfileFilled /> {intl({ id: 'org.umi.ui.global.log' })}
        </div>

        <div className={styles.section}>
          {/* TODO: register with framework, bigfish use office network */}
          <Popover
            title={null}
            placement="top"
            content={
              <div className={styles.feedback}>
                <img
                  width={150}
                  height={200}
                  src={
                    window.g_bigfish
                      ? '//gw-office.alipayobjects.com/basement_prod/bd018d14-7cfd-4410-97dc-84bfd7bb6a8c.jpg'
                      : '//gw.alipayobjects.com/zos/antfincdn/30ktM0fuXZ/fe121f6c-154e-45e1-aa00-e60164cf8739.png'
                  }
                />
              </div>
            }
          >
            <a>
              <Message />{' '}
              {type === 'loading'
                ? intl({ id: 'org.umi.ui.global.feedback' })
                : intl({ id: 'org.umi.ui.global.feedback' })}
            </a>
          </Popover>
        </div>

        {FOOTER_RIGHT.map((item, i) => (
          <div className={styles.section} key={i.toString()}>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.icon} {intl({ id: item.title })}
            </a>
          </div>
        ))}
        <div className={styles.section} style={{ cursor: 'pointer' }}>
          <Dropdown overlay={menu} placement="topRight">
            <p>
              <LocaleText locale={locale} />
              {/* <span style={{ marginLeft: 8 }}>
                <Swap />
              </span> */}
            </p>
          </Dropdown>
        </div>
      </div>
      <Drawer
        title={
          <div className={styles['section-drawer-title']}>
            <h1>{intl({ id: 'org.umi.ui.global.log.upperCase' })}</h1>
            <div className={styles['section-drawer-title-action']}>
              <Popconfirm
                title={intl({ id: 'org.umi.ui.global.log.clear.confirm' })}
                onConfirm={handleClearLog}
                okText={intl({ id: 'org.umi.ui.global.okText' })}
                cancelText={intl({ id: 'org.umi.ui.global.cancelText' })}
              >
                <Tooltip title={intl({ id: 'org.umi.ui.global.log.clear.tooltip' })}>
                  <Delete />
                </Tooltip>
              </Popconfirm>
              <Tooltip title={intl({ id: 'org.umi.ui.global.log.enter.tooltip' })}>
                <Enter onClick={handleScorllBottom} />
              </Tooltip>
              <Divider type="vertical" />
              <Close onClick={hideLogPanel} />
            </div>
          </div>
        }
        closable={false}
        visible={logVisible}
        placement="bottom"
        mask={false}
        className={styles['section-drawer']}
        height={300}
      >
        <Logs
          logs={logs}
          type={type}
          className={styles['section-drawer-logs']}
          style={{
            height: 225,
          }}
        />
      </Drawer>
    </div>
  );
};

export default Footer;
