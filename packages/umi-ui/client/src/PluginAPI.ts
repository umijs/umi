import { notification } from 'antd';
import { connect } from 'dva';
import lodash from 'lodash';
import history from '@tmp/history';
// eslint-disable-next-line no-multi-assign
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { FC } from 'react';
import { IUi } from 'umi-types';
import querystring from 'querystring';
import { send, callRemote, listenRemote } from './socket';
import event, { MESSAGES } from '@/message';
import { pluginDebug } from '@/debug';
import ConfigForm from './components/ConfigForm';
import TwoColumnPanel from './components/TwoColumnPanel';
import { openInEditor, openConfigFile } from '@/services/project';
import Field from './components/Field';

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
  ConfigForm: FC<IUi.IConfigFormProps>;
  Field: FC<IUi.IFieldProps>;
  connect: IUi.IConnect;

  constructor(service: IUi.IService, currentProject: IUi.ICurrentProject) {
    this.service = service;
    this.callRemote = callRemote;
    this.listenRemote = listenRemote;
    this.send = send;
    this._ = lodash;
    this.debug = pluginDebug;
    this.currentProject =
      {
        ...currentProject
      } || {};
    this.TwoColumnPanel = TwoColumnPanel;
    this.Field = Field;
    this.ConfigForm = ConfigForm;
    this.connect = connect as IUi.IConnect;
  }

  addConfigSection(section) {
    this.service.configSections.push(section);
  }

  registerModel = model => {
    window.g_app.model(model);
  };

  launchEditor = async ({ type = 'project', lineNumber = 0, editor }) => {
    if (type === 'project') {
      await openInEditor({
        key: this.currentProject.key,
      });
    }
    if (type === 'config') {
      await openConfigFile({
        projectPath: this.currentProject.path,
      });
    }
    // TODO
  };

  isMini: IUi.IMini = () => 'mini' in (querystring.parse(window.location.search.slice(1)) || {});

  showMini: IUi.IShowMini = () => {
    if (this.isMini) {
      window.parent.postMessage(
        JSON.stringify({
          action: 'umi.ui.showMini',
        }),
        '*',
      );
    }
  };

  hideMini: IUi.IHideMini = () => {
    if (this.isMini) {
      window.parent.postMessage(
        JSON.stringify({
          action: 'umi.ui.hideMini',
        }),
        '*',
      );
    }
  };

  redirect: IUi.IRedirect = url => {
    history.push(url);
    // window.location.reload();
  };

  showLogPanel: IUi.IShowLogPanel = () => {
    event.emit(MESSAGES.SHOW_LOG);
  };

  setActionPanel: IUi.ISetActionPanel = actions => {
    event.emit(MESSAGES.CHANGE_GLOBAL_ACTION, actions);
  };

  hideLogPanel: IUi.IHideLogPanel = () => {
    event.emit(MESSAGES.HIDE_LOG);
  };

  getSharedDataDir = async () => {
    const { tmpDir } = await callRemote({
      type: '@@project/getSharedDataDir',
    });
    return tmpDir;
  };

  detectLanguage = async () => {
    const { language } = await callRemote({
      type: '@@project/detectLanguage',
    });
    return language;
  };

  getCwd: IUi.IGetCwd = async () => {
    const { cwd } = await callRemote({
      type: '@@fs/getCwd',
    });
    return cwd;
  };

  intl: IUi.IIntl = formatMessage;
  FormattedMessage = FormattedMessage;

  getLocale: IUi.IGetLocale = () => {
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
