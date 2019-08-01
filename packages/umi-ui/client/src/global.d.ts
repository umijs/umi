declare module '@tmp/history';
declare module '*.less';
declare module '*.css';

import { Context } from 'react';
import { IUi } from 'umi-types';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

declare global {
  interface Window {
    xterm: any;
    g_uiPlugins?: any[];
    g_uiContext: Context<IUi.IContext>;
    g_uiLocales: IUi.ILocale;
    g_service: IUi.IService;
  }
}

type lang = (keyof typeof zhCN) & (keyof typeof enUS);

declare module 'umi-plugin-locale' {
  export default interface MessageDescriptor {
    id: lang extends string ? lang : string;
  }
}
