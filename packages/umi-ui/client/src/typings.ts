import { IRoute } from 'umi-types';

export enum LOCALES {
  'zh-CN' = '中文',
  'en-US' = 'English',
}

export type ILang = keyof typeof LOCALES;

export interface IContext {
  locale?: ILang;
}

export type ILocale = { [x in ILang]: { [key in string]: string } };

export type IPanel = IRoute;

export interface IService {
  panels: IPanel[];
  locales: ILocale[];
}

export type ICallRemove = (params: { type: string }) => object;

export type IListenRemote = (action: { type: string; onMessage: (p: any) => void }) => void;

export type ISend = (action: { type: string; onProgress: (p: any) => void }) => void;
