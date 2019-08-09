import * as lodash from 'lodash';
import { Context, ReactNode } from 'react';
import { formatMessage, FormattedMessage, setLocale } from './locale';
import { IRoute } from './';

declare namespace IUI {
  export enum LOCALES {
    'zh-CN' = '中文',
    'en-US' = 'English',
  }

  type ILang = keyof typeof LOCALES;

  interface IContext {
    locale?: ILang;
    formatMessage: typeof formatMessage;
    FormattedMessage: typeof FormattedMessage;
    setLocale: typeof setLocale;
    showLog: () => void;
    hideLog: () => void;
  }

  type ILocale = { [x in ILang]: { [key in string]: string } };

  type IPanel = IRoute;

  interface IService {
    panels: IPanel[];
    locales: ILocale[];
  }

  interface IAction<T = object, K = void> {
    type: string;
    payload?: T;
    onProgress?: (data: K) => Promise<K>;
    onMessage?: (data: any) => Promise<K>;
  }

  type IApiActionFactory<P = {}, K = {}> = (action: IAction<P, K>) => K;

  type ICallRemove = IApiActionFactory;
  type IListenRemote = IApiActionFactory<{}, void>;
  type ISend = IApiActionFactory<{}, void>;

  class IApiClass {
    constructor(service: IService);
    service: IService;
    /** lodash */
    readonly _: typeof lodash;

    /** add plugin Panel */
    addPanel(panel: IPanel): void;
    addLocales(locale: ILocale): void;
    /** react component context */
    getContext(): Context<IContext>;
    callRemote: ICallRemove;
    TwoColumnPanel: ReactNode;
    listenRemote: IListenRemote;
    showLog: () => void;
    send: ISend;
  }

  type IApi = InstanceType<typeof IApiClass>;
}

export = IUI;
