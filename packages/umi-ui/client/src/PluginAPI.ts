import { notification, message } from 'antd';
import { connect } from 'dva';
import lodash from 'lodash';
import history from '@tmp/history';
// eslint-disable-next-line no-multi-assign
import * as intl from 'umi-plugin-react/locale';
import isPlainObject from 'lodash/isPlainObject';
import { FC } from 'react';
import { IUi } from 'umi-types';
import moment from 'moment';
import qs from 'qs';
import { send, callRemote, listenRemote } from './socket';
import event, { MESSAGES } from '@/message';
import { pluginDebug } from '@/debug';
import Terminal from '@/components/Terminal';
import StepForm from '@/components/StepForm';
import DirectoryForm from '@/components/DirectoryForm';
import ConfigForm from './components/ConfigForm';
import TwoColumnPanel from './components/TwoColumnPanel';
import { openInEditor, openConfigFile } from '@/services/project';
import { isMiniUI, getDuplicateKeys } from '@/utils';
import Field from './components/Field';

// PluginAPI
export default class PluginAPI {
  service: IUi.IService;
  _: IUi.ILodash;
  debug: IUi.IDebug;
  callRemote: IUi.ICallRemote;
  listenRemote: IUi.IListenRemote;
  send: IUi.ISend;
  currentProject: IUi.ICurrentProject;
  TwoColumnPanel: FC<IUi.ITwoColumnPanel>;
  Terminal: FC<IUi.ITerminalProps>;
  DirectoryForm: FC<IUi.IDirectoryForm>;
  StepForm: IUi.IStepForm;
  ConfigForm: FC<IUi.IConfigFormProps>;
  Field: FC<IUi.IFieldProps>;
  connect: IUi.IConnect;
  mini: boolean;
  bigfish: boolean;
  history: any;
  event: IUi.IEvent;
  moment: IUi.IMoment;

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
    this.Terminal = Terminal;
    this.DirectoryForm = DirectoryForm;
    this.StepForm = StepForm;
    this.Field = Field;
    this.ConfigForm = ConfigForm;
    this.bigfish = !!window.g_bigfish;
    this.connect = connect as IUi.IConnect;
    this.mini = isMiniUI();
    this.event = event;
    this.moment = moment;
    this.history = history;

    const proxyIntl = new Proxy(intl, {
      get: (target, prop: any) => {
        if (
          [
            'FormattedDate',
            'FormattedTime',
            'FormattedRelative',
            'FormattedNumber',
            'FormattedPlural',
            'FormattedMessage',
            'FormattedHTMLMessage',
            'formatMessage',
            'formatHTMLMessage',
            'formatDate',
            'formatTime',
            'formatRelative',
            'formatNumber',
            'formatPlural',
          ].includes(prop)
        ) {
          return intl[prop];
        }
        return undefined;
      },
    });

    // mount react-intl API∂
    Object.keys(proxyIntl).forEach(intlApi => {
      this.intl[intlApi] = intl[intlApi];
    });
  }

  addConfigSection(section) {
    this.service.configSections.push(section);
  }

  registerModel = model => {
    window.g_app.model(model);
  };

  launchEditor = async ({ type = 'project', lineNumber = 0, editor }) => {
    try {
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
    } catch (e) {
      message.error(e.message);
    }
  };

  isMini: IUi.IMini = () => isMiniUI();

  showMini: IUi.IShowMini = () => {
    if (this.isMini()) {
      window.parent.postMessage(
        JSON.stringify({
          action: 'umi.ui.showMini',
        }),
        '*',
      );
    }
  };

  hideMini: IUi.IHideMini = () => {
    if (this.isMini()) {
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

  setProjectCurrent = (...args) => {
    event.emit(MESSAGES.CHANGE_PROJECT_CURRENT, ...args);
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

  /**
   * get query params /?bar=&foo=&mini
   */
  getSearchParams: IUi.IGetSearchParams = () => {
    return qs.parse(window.location.search, { ignoreQueryPrefix: true });
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

  detectNpmClients = async () => {
    const { npmClients } = await callRemote({
      type: '@@project/detectNpmClients',
    });
    return npmClients;
  };

  getCwd: IUi.IGetCwd = async () => {
    const { cwd } = await callRemote({
      type: '@@fs/getCwd',
    });
    return cwd;
  };

  intl: IUi.IIntl = intl.formatMessage;

  getLocale: IUi.IGetLocale = () => window.g_lang;

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
        const frameName = this.service.basicUI.name || 'Umi';
        if (e && e.message) {
          e.message = `${frameName}: params: ${JSON.stringify(payload)} ${e.message}`;
        }
        window.Tracert.logError(e, {
          // framework use umi ui
          d1: frameName,
        });
      }
    }
  };

  getContext() {
    return window.g_uiContext;
  }

  getBasicUI: IUi.IGetBasicUI = () => {
    const { basicUI } = this.service;
    return Object.freeze(basicUI);
  };

  addPanel: IUi.IAddPanel = panel => {
    this.service.panels.push(panel);
  };

  getDashboard: IUi.IGetDashboard = () => this.service.dashboard;

  addDashboard: IUi.IAddDashboard = config => {
    if (!isPlainObject(config) && !Array.isArray(config)) {
      console.error('api.addDashboard config error', config);
      return;
    }
    const configs = Array.isArray(config) ? config : [config];
    const tweakConfigs = configs.map(c => ({ ...c, enable: true }));
    tweakConfigs.forEach(tweakConfig => {
      const repeatConfig = this.service.dashboard.find(card => card.key === tweakConfig.key);
      if (!repeatConfig) {
        this.service.dashboard.push(tweakConfig);
      } else {
        // repeat key error
        console.error(`Umi UI dashboard card key must be unique, but found ${repeatConfig.key}`);
      }
    });
  };

  // modify basic UI api.modifyBasicUI({  })
  modifyBasicUI: IUi.IModifyBasicUI = memo => {
    Object.keys(memo).forEach(extend => {
      if (memo[extend]) {
        (this.service.basicUI as any)[extend] = memo[extend];
      }
    });
  };

  addLocales: IUi.IAddLocales = locale => {
    const duplicateKeys = getDuplicateKeys(this.service.locales.concat(locale)) || [];
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
