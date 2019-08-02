import * as lodash from 'lodash';
import { Context } from 'react';
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
  }

  type ILocale = { [x in ILang]: { [key in string]: string } };

  type IPanel = IRoute;

  interface IService {
    panels: IPanel[];
    locales: ILocale[];
  }

  type IApiActionFactory<P = {}, K = void> = (action: { type: string } & P) => K;

  type ICallRemove = IApiActionFactory<{}, object>;
  type IListenRemote = IApiActionFactory<{ onMessage: (p: any) => void }>;
  type ISend = IApiActionFactory<{ onProgress: (p: any) => void }>;

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
    listenRemote: IListenRemote;
    send: ISend;
  }

  type IApi = InstanceType<typeof IApiClass>;
}

export = IUI;
