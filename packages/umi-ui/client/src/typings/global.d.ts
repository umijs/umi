import EventEmitter from 'events';
import { Context } from 'react';

import { IUi } from 'umi-types';
import zhCN from '../locales/zh-CN';

declare global {
  interface Window {
    xterm: any;
    g_lang: IUi.ILang;
    g_uiPlugins?: any[];
    g_uiContext: Context<IUi.IContext>;
    g_uiLocales: IUi.ILocale;
    g_service: IUi.IService;
    g_uiEventEmitter: EventEmitter;
  }
}

type lang = keyof typeof zhCN;

declare module 'umi-plugin-react/locale' {
  export default interface MessageDescriptor {
    id: lang extends string ? lang : string;
  }
}
