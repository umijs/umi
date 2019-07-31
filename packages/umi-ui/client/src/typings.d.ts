import { IRoute } from 'umi-types';

export enum Locales {
  'zh-CN' = 'zh-CN',
  'en-US' = 'en-US',
}

export interface IContext {
  locale?: keyof typeof Locales;
}

export type ILocale = { [x in Locales]: { [key in string]: string } };

export type IPanel = IRoute;

export interface IService {
  panels: IPanel[];
  locales: ILocale[];
}

export type ICallRemove = (params: { type: string }) => object;

export type IListenRemote = (action: { type: string, onMessage: (p: any) => void; }) => void;

export type ISend = (action: { type: string, onProgress: (p: any) => void; }) => void;

