import { Context } from 'react';
import { IContext, ILocale, IService } from './typings';

declare module '@tmp/history';
declare module '*.less';
declare module '*.css';

declare global {
  interface Window {
    xterm: any;
    g_uiPlugins?: any[];
    g_uiContext?: Context<IContext>;
    g_uiLocales: ILocale[];
    g_service: IService;
  }
}
