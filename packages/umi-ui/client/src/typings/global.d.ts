import EventEmitter from 'events';
import { Context } from 'react';
import { Debugger } from 'debug';

import { IUi } from 'umi-types';
import { Terminal } from 'xterm';
import zhCN from '../locales/zh-CN';

declare global {
  interface Window {
    xterm: any;
    gtag?: any;
    Tracert?: any;
    g_app?: any;
    Terminal?: typeof Terminal;
    fit?: any;
    g_lang: IUi.ILang;
    g_uiCurrentProject: IUi.ICurrentProject;
    g_uiProjects?: { [key: string]: IUi.ICurrentProject };
    g_uiPlugins?: any[];
    g_bigfish?: boolean;
    g_uiContext: Context<IUi.IContext>;
    g_service: IUi.IService;
    g_uiBasicUI: Function[];
  }
}

type lang = keyof typeof zhCN;

declare module 'umi-plugin-react/locale' {
  export default interface MessageDescriptor {
    id: lang extends string ? lang : string;
  }
}
