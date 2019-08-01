declare module '@tmp/history';
declare module '*.less';
declare module '*.css';

import { Context } from 'react';
import { IContext, ILocale, IService } from './typings';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

declare global {
  interface Window {
    xterm: any;
    g_uiPlugins?: any[];
    g_uiContext?: Context<IContext>;
    g_uiLocales: ILocale[];
    g_service: IService;
  }
}

type lang = (keyof typeof zhCN) & (keyof typeof enUS);

declare module 'umi-plugin-locale' {
  export default interface MessageDescriptor {
    id: lang extends string ? lang : string;
  }
}
