import lodash from 'lodash';
import { connect } from 'react-redux';
import { Debugger } from 'debug';
import { ReactNode, Context, FC, FunctionComponent } from 'react';
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

  export enum CONFIG_TYPES {
    'string' = 'string',
    'string[]' = 'string[]',
    'boolean' = 'boolean',
    'object' = 'object',
    'object[]' = 'object[]',
    'list' = 'list',
    'textarea' = 'textarea',
    'any' = 'any',
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
    isMini: boolean;
  }

  type Locale = { [key in string]: string };

  type ILocale = { [x in ILang]: Locale };

  interface IconType {
    type: string;
    theme?: 'filled' | 'outlined' | 'twoTone';
    rotate?: number;
    twoToneColor?: string;
  }

  interface IPanelConfigAction {
    title: string;
    type?: 'default' | 'primary';
    action?: IAction;
    onClick?: () => void;
  }

  type IPanelAction = IPanelConfigAction | ReactNode;

  interface IPanel extends IRoute {
    path: string;
    component: ReactNode;
    icon: IconType | string;
    actions?: IPanelAction[];
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

  type IValue = string | object | boolean | string[] | object[];

  interface IFieldLabel {
    /** label title */
    title: string;
    /** label description */
    description: string;
    /** description detail link */
    link: string;
  }

  export interface IFieldProps {
    /** formItem type */
    type: IConfigTypes;
    /** form field name */
    name: string;
    /** defaultValue（only using in `object` field type）  */
    defaultValue?: IValue;
    /** Array Select options */
    options?: string[];
    /** antd form ins */
    form: object;
    /** antd label, if object using <Label /> */
    label: string | ReactNode | IFieldLabel;
    /** same as antd Form.Item props */
    [key: string]: any;
  }

  type IConfigTypes = keyof typeof CONFIG_TYPES;

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
  type IIntl = typeof formatMessage;
  type IGetCwd = () => Promise<string>;

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
  type IRegisterModel = (model: any) => void;
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
    taobaoSpeedUp?: boolean;
  }
  type IRedirect = (url: string) => void;
  type IDebug = Debugger;
  type IConnect = typeof connect;
  type IMini = () => boolean;
  type IShowMini = () => void;
  type IHideMini = () => void;

  class IApiClass {
    constructor(service: IService);
    service: IService;
    /** lodash */
    readonly _: ILodash;
    /** debug for client */
    readonly debug: IDebug;
    /** currentProject  */
    currentProject: ICurrentProject;
    getCwd: IGetCwd;
    /** intl */
    intl: IIntl;
    /** add plugin Panel */
    addPanel: IAddPanel;
    /** register dva model Panel */
    registerModel: IRegisterModel;
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
    /** Antd Form Field */
    Field: FC<IFieldProps>;
    listenRemote: IListenRemote;
    /** open footer log panel */
    showLogPanel: IShowLogPanel;
    /** close footer log panel */
    hideLogPanel: IHideLogPanel;
    /** show Mini Modal */
    showMini: IShowMini;
    /** hide Mini Modal */
    hideMini: IHideMini;
    send: ISend;
    connect: IConnect;
  }

  type IApi = InstanceType<typeof IApiClass>;
}

export = IUI;
