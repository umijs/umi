import lodash from 'lodash';
import { Context, FC, FunctionComponent } from 'react';
import { formatMessage, FormattedMessage, setLocale } from './locale';
import { IRoute } from './';

declare namespace IUI {
  export enum LOCALES {
    'zh-CN' = '中文',
    'en-US' = 'English',
  }

  export enum THEME {
    'dark' = 'dark',
    'light' = 'light',
  }

  type ILang = keyof typeof LOCALES;
  type ITheme = keyof typeof THEME;

  interface IContext {
    theme: ITheme;
    locale: ILang;
    currentProject?: ICurrentProject;
    formatMessage: typeof formatMessage;
    FormattedMessage: typeof FormattedMessage;
    setLocale: typeof setLocale;
    setTheme: (theme: ITheme) => void;
    showLogPanel: () => void;
    hideLogPanel: () => void;
  }

  type Locale = { [key in string]: string };

  type ILocale = { [x in ILang]: Locale };

  interface IconType {
    type: string;
    theme?: 'filled' | 'outlined' | 'twoTone';
    rotate?: number;
    twoToneColor?: string;
  }

  interface IPanel extends IRoute {
    icon: IconType | string;
  }

  interface IService {
    panels: IPanel[];
    locales: ILocale[];
  }

  interface IAction<T = object, K = void> {
    type: string;
    payload?: T;
    onProgress?: (data: K) => void;
    onMessage?: (data: any) => void;
    keep?: boolean;
  }

  interface ITwoColumnPanel {
    className?: string;
    sections: Array<{
      key?: string;
      title: string;
      icon: string | React.ReactNode;
      description: string;
      component: FunctionComponent<any>;
    }>;
    disableLeftOverflow?: boolean;
    disableRightOverflow?: boolean;
  }

  type IApiActionFactory<P = {}, K = {}> = (action: IAction<P, K>) => K;

  type ICallRemote = IApiActionFactory;
  type IListenRemote = IApiActionFactory<{}, () => void>;
  type ISend = IApiActionFactory<{}, void>;
  type IIntl = (key: string | undefined) => string;

  interface INotifyParams {
    title: string;
    message: string;
    subtitle?: string;
    /** URL to open on click */
    open?: string;
    /**
     * The amount of seconds before the notification closes.
     * Takes precedence over wait if both are defined.
     */
    timeout?: number;
    /** notify type, default info */
    type?: 'error' | 'info' | 'warning' | 'success';
  }
  type INotify = (params: INotifyParams) => void | boolean;
  type IAddPanel = (panel: IPanel) => void;
  type IAddLocales = (locale: ILocale) => void;
  type IShowLogPanel = () => void;
  type IHideLogPanel = () => void;
  type ILodash = typeof lodash;
  interface ICurrentProject {
    key?: string;
    name?: string;
    path?: string;
    created_at?: number;
    opened_at?: number;
    npmClient?: string;
  }
  type IRedirect = (url: string) => void;

  class IApiClass {
    constructor(service: IService);
    service: IService;
    /** lodash */
    readonly _: ILodash;

    /** currentProject  */
    currentProject: ICurrentProject;
    /** intl */
    intl: IIntl;
    /** add plugin Panel */
    addPanel: IAddPanel;
    /** add plugin locales { zh-CN: {}, en-US: {} } */
    addLocales: IAddLocales;
    /** react component context */
    getContext(): Context<IContext>;
    /** system notify */
    notify: INotify;
    /** redirect */
    redirect: IRedirect;
    callRemote: ICallRemote;
    /** React Two Column Panel Layout */
    TwoColumnPanel: FC<ITwoColumnPanel>;
    listenRemote: IListenRemote;
    /** open footer log panel */
    showLogPanel: IShowLogPanel;
    /** close footer log panel */
    hideLogPanel: IHideLogPanel;
    send: ISend;
  }

  type IApi = InstanceType<typeof IApiClass>;
}

export = IUI;
