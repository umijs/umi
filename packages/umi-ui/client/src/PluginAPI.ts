import { notification } from 'antd';
import { connect } from 'dva';
import lodash from 'lodash';
import debug from 'debug';
import history from '@tmp/history';
// eslint-disable-next-line no-multi-assign
import { formatMessage } from 'umi-plugin-react/locale';
import { FC } from 'react';
import { IUi } from 'umi-types';
import querystring from 'querystring';
import { send, callRemote, listenRemote } from './socket';
import TwoColumnPanel from './components/TwoColumnPanel';
import Field from './components/Field';

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
  TwoColumnPanel: FC<IUi.ITwoColumnPanel>;
  Field: FC<IUi.IFieldProps>;
  connect: IUi.IConnect;

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
    this.Field = Field;
    this.connect = connect as IUi.IConnect;
  }

  registerModel = model => {
    window.g_app.model(model);
  };

  isMini: IUi.IMini = () => {
    return 'mini' in querystring.parse(window.location.search.slice(1));
  };

  redirect: IUi.IRedirect = url => {
    history.push(url);
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

  getCwd: IUi.IGetCwd = async () => {
    const { cwd } = await callRemote({
      type: '@@fs/getCwd',
    });
    return cwd;
  };

  intl: IUi.IIntl = formatMessage;

  getLocale = () => {
    return window.g_lang;
  };

  notify: IUi.INotify = async payload => {
    const { title, message, subtitle, ...restPayload } = payload;
    // need intl text
    const intlParams = {
      title: title ? this.intl({ id: title }) : '',
      message: message ? this.intl({ id: message }) : '',
      subtitle: subtitle ? this.intl({ id: subtitle }) : '',
    };

    try {
      if (document.hasFocus()) {
        // focus use antd Notification
        notification[payload.type || 'info']({
          message: intlParams.title,
          description: intlParams.message,
          duration: payload.timeout || 4.5,
        });
      } else {
        // use system Notification
        await callRemote({
          type: '@@app/notify',
          payload: {
            ...intlParams,
            ...restPayload,
          },
        });
      }
    } catch (e) {
      console.error('UI notification  error', e);
      if (this._.get(window, 'Tracert.logError')) {
        if (e && e.message) {
          e.message = `${window.g_bigfish ? 'Bigfish' : 'Umi'}: params: ${JSON.stringify(
            payload,
          )} ${e.message}`;
        }
        window.Tracert.logError(e, {
          // framework use umi ui
          d1: window.g_bigfish ? 'Bigfish' : 'Umi',
        });
      }
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
