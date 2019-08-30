import { notification } from 'antd';
import lodash from 'lodash';
import debug from 'debug';
import history from '@tmp/history';
// eslint-disable-next-line no-multi-assign
import { formatMessage } from 'umi-plugin-react/locale';
import { ReactNode } from 'react';
import { IUi } from 'umi-types';
import { send, callRemote, listenRemote } from './socket';
import TwoColumnPanel from './components/TwoColumnPanel';

const _debug = debug('umiui');

// PluginAPI
export default class PluginAPI {
  public service: IUi.IService;
  public _: IUi.ILodash;
  public debug: IUi.IDebug;
  callRemote: IUi.ICallRemote;
  listenRemote: IUi.IListenRemote;
  send: IUi.ISend;
  currentProject: IUi.ICurrentProject;
  TwoColumnPanel: ReactNode;

  constructor(service: IUi.IService, currentProject: IUi.ICurrentProject) {
    this.service = service;
    this.callRemote = callRemote;
    this.listenRemote = listenRemote;
    this.send = send;
    this._ = lodash;
    this.debug = _debug.extend('UIPlugin');
    this.currentProject =
      {
        ...currentProject
      } || {};
    this.TwoColumnPanel = TwoColumnPanel;
  }

  redirect: IUi.IRedirect = url => {
    history.replace(url);
    // window.location.reload();
  };

  showLogPanel: IUi.IShowLogPanel = () => {
    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.emit('SHOW_LOG');
    }
  };
  hideLogPanel: IUi.IHideLogPanel = () => {
    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.emit('HIDE_LOG');
    }
  };

  intl: IUi.IIntl = (key, message = {}) => {
    const { g_lang: locale, g_uiLocales: localeMessages } = window;
    if (typeof key !== 'string') return '';
    if (key in (localeMessages[locale] || {})) {
      return formatMessage(
        {
          id: key,
        },
        message,
      );
    }
    return key;
  };

  getLocale = () => {
    return window.g_lang;
  };

  notify: IUi.INotify = async payload => {
    const { title, message, subtitle, ...restPayload } = payload;

    // need intl text
    const intlParams = {
      title: this.intl(title),
      message: this.intl(message),
      subtitle: this.intl(subtitle),
    };

    if (document.hasFocus()) {
      // focus use antd Notification
      try {
        notification[payload.type]({
          message: intlParams.title,
          description: intlParams.message,
          duration: payload.timeout || 4.5,
        });
        // prevent system notify
        return false;
      } catch (e) {
        console.error('UI notification  error', e);
      }
    }

    // else use system Notification
    try {
      await callRemote({
        type: '@@app/notify',
        payload: {
          ...intlParams,
          ...restPayload,
        },
      });
    } catch (e) {
      console.error('System notification error', e);
    }
  };

  getContext() {
    return window.g_uiContext;
  }

  private getDuplicateKeys(locales: IUi.ILocale[]): string[] {
    if (!Array.isArray(locales)) return [];
    const allLocaleKeys = locales.reduce(
      (curr, acc) => {
        // { key: value, key2, value }
        const localeObj = Object.values(acc).reduce(
          (c, locale) => ({
            ...c,
            ...locale,
          }),
          {},
        );
        const localeKeys = Object.keys(localeObj);
        return curr.concat(localeKeys);
      },
      [] as string[],
    );

    const _seen = new Set();
    const _store: string[] = [];
    return allLocaleKeys.filter(
      item => _seen.size === _seen.add(item).size && !_store.includes(item) && _store.push(item),
    );
  }

  addPanel: IUi.IAddPanel = panel => {
    this.service.panels.push(panel);
  };

  addLocales: IUi.IAddLocales = locale => {
    const duplicateKeys = this.getDuplicateKeys(this.service.locales.concat(locale)) || [];
    if (duplicateKeys.length > 0) {
      const errorMsg = `Conflict locale keys found in ['${duplicateKeys.join("', '")}']`;
      // 不影响渲染主流程
      console.error(errorMsg);
      // document.getElementById('root').innerHTML = errorMsg;
      // throw new Error(errorMsg);
    }

    this.service.locales.push(locale);
  };
}
