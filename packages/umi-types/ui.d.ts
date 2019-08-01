import * as lodash from 'lodash';
import { Context } from 'react';
import { formatMessage, FormattedMessage } from './locale';
import { IRoute } from './';

declare enum LOCALES {
  'zh-CN' = '中文',
  'en-US' = 'English',
}

declare namespace IUI {
  type ILang = keyof typeof LOCALES;

  interface IContext {
    locale?: ILang;
    formatMessage: typeof formatMessage;
    FormattedMessage: typeof FormattedMessage;
  }

  type ILocale = { [x in ILang]: { [key in string]: string } };

  type IPanel = IRoute;

  interface IService {
    panels: IPanel[];
    locales: ILocale[];
  }

  type IApiActionFactory<P = {}, K = void> = (action: { type: string } & P) => K;

  class IApiClass {
    constructor(service: IService);
    service: IService;
    /** lodash */
    _: typeof lodash;

    /** react component context */
    getContext(): Context<IContext>;
    callRemote: IApiActionFactory<{}, object>;
    listenRemote: IApiActionFactory<{ onMessage: (p: any) => void }>;
    send: IApiActionFactory<{ onProgress: (p: any) => void }>;
  }

  type IApi = InstanceType<typeof IApiClass>;
}

export = IUI;
