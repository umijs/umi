import lodash from 'lodash';
// eslint-disable-next-line no-multi-assign
import { formatMessage } from 'umi-plugin-react/locale';
import { ReactNode } from 'react';
import { IUi } from 'umi-types';
import { send, callRemote, listenRemote } from './socket';
import TwoColumnPanel from './components/TwoColumnPanel';

// PluginAPI
export default class PluginAPI {
  public service: IUi.IService;
  public _: IUi.ILodash;
  callRemote: IUi.ICallRemove;
  listenRemote: IUi.IListenRemote;
  send: IUi.ISend;
  TwoColumnPanel: ReactNode;

  constructor(service: IUi.IService) {
    this.service = service;
    this.callRemote = callRemote;
    this.listenRemote = listenRemote;
    this.send = send;
    this._ = lodash;
    this.TwoColumnPanel = TwoColumnPanel;
  }

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

  intl: IUi.IIntl = key => {
    const { g_lang: locale, g_uiLocales: localeMessages } = window;
    if (typeof key !== 'string') return '';
    if (key in (localeMessages[locale] || {})) {
      return formatMessage({
        id: key,
      });
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

    try {
      await callRemote({
        type: '@@app/notify',
        payload: {
          ...intlParams,
          ...restPayload,
        },
      });
    } catch (e) {
      console.error('notify error', e);
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
