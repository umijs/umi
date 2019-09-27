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

  type IPanelAction = (IPanelConfigAction | ReactNode | FC)[];

  interface IPanel extends IRoute {
    path: string;
    component: ReactNode;
    icon: IconType | string;
    actions?: IPanelAction;
    beta?: boolean;
  }

  interface IService {
    panels: IPanel[];
    locales: ILocale[];
    configSections: any[];
  }

  type SetFactory<T> = ((state: T) => T) | T;

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

  // from fuzz.js
  export interface FuseOptions<T> {
    id?: keyof T;
    caseSensitive?: boolean;
    includeMatches?: boolean;
    includeScore?: boolean;
    shouldSort?: boolean;
    sortFn?: (a: { score: number }, b: { score: number }) => number;
    getFn?: (obj: any, path: string) => any;
    keys?: (keyof T)[] | T[keyof T] | { name: keyof T; weight: number }[];
    verbose?: boolean;
    tokenize?: boolean;
    tokenSeparator?: RegExp;
    matchAllTokens?: boolean;
    location?: number;
    distance?: number;
    threshold?: number;
    maxPatternLength?: number;
    minMatchCharLength?: number;
    findAllMatches?: boolean;
  }

  interface IConfigFormProps {
    /** config title in the top */
    title: string;
    /** list config interface */
    list: string;
    /** edit config interface */
    edit: string;
    /** enable Toc, default false */
    enableToc?: boolean;
    /** Search fuse options */
    fuseOpts?: FuseOptions<number>;
  }

  type IApiActionFactory<P = {}, K = {}> = (action: IAction<P, K>) => Promise<K>;

  type ICallRemote<T = unknown, P = unknown> = IApiActionFactory<T, P>;
  type IListenRemote = IApiActionFactory<{}, () => void>;
  type ISend = IApiActionFactory<{}, void>;
  type IIntl = typeof formatMessage;
  type IFormattedMessage = typeof FormattedMessage;
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
  type IGetLocale = () => ILang;
  type IGetSharedDataDir = () => Promise<string>;
  type ISetActionPanel = (action: SetFactory<IPanelAction>) => void;
  type LaunchEditorTypes = 'project' | 'config';
  // beta API, not show in doc
  type ILaunchEditor = (type: LaunchEditorTypes, lineNumber?: number, editor?: string) => void;

  interface IContext {
    theme: ITheme;
    locale: ILang;
    currentProject?: ICurrentProject;
    formatMessage: IIntl;
    FormattedMessage: IFormattedMessage;
    setLocale: typeof setLocale;
    setTheme: (theme: ITheme) => void;
    /** open footer log panel */
    showLogPanel: IShowLogPanel;
    /** close footer log panel */
    hideLogPanel: IHideLogPanel;
    isMini: boolean;
  }

  class IApiClass {
    constructor(service: IService);
    service: IService;
    /** lodash */
    readonly _: ILodash;
    /** debug for client */
    readonly debug: IDebug;
    /** currentProject  */
    currentProject: ICurrentProject;
    /** get current locale: zh-CN or en-US */
    getLocale: IGetLocale;
    getCwd: IGetCwd;
    /** current is in Mini version */
    isMini: () => boolean;
    /** intl, formatMessage */
    intl: IIntl;
    /** FormattedMessage Component  */
    FormattedMessage: IFormattedMessage;
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
    /** React Config Form Component */
    ConfigForm: FC<IConfigFormProps>;
    /** Antd Form Field */
    Field: FC<IFieldProps>;
    listenRemote: IListenRemote;
    launchEditor: ILaunchEditor;
    /** open footer log panel */
    showLogPanel: IShowLogPanel;
    /** close footer log panel */
    hideLogPanel: IHideLogPanel;
    setActionPanel: ISetActionPanel;
    /** show Mini Modal */
    showMini: IShowMini;
    /** hide Mini Modal */
    hideMini: IHideMini;
    send: ISend;
    connect: IConnect;
    /** get the current project's temp dir path */
    getSharedDataDir: IGetSharedDataDir;
  }

  type IApi = InstanceType<typeof IApiClass>;
}

export = IUI;
