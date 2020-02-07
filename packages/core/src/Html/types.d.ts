import { IConfig, IRoute } from '..';

export interface IHTMLTag {
  [key: string]: string;
}

export interface IModifyHTML {
  (memo: any, args: any): Promise<any>;
}

export interface IAddHTML<T> {
  (memo: T, args: { route?: IRoute }): Promise<T>;
}

export interface IScript extends Partial<HTMLScriptElement> {
  content?: string;
}

export type IScriptConfig = Array<IScript | string>;

export interface IOpts {
  config: IConfig;
  tplPath?: string;
  addHTMLHeadScripts?: IAddHTML<IScriptConfig>;
  addHTMLScripts?: IAddHTML<IScriptConfig>;
  addHTMLMetas?: IAddHTML<IHTMLTag[]>;
  addHTMLLinks?: IAddHTML<IHTMLTag[]>;
  addHTMLStyles?: IAddHTML<IHTMLTag[]>;
  modifyHTML?: IModifyHTML;
}

export interface ILink {
  [key: string]: string;
}

export interface IStyle {
  [key: string]: string;
}

export interface IHtmlConfig {
  metas?: IHTMLTag[];
  links?: ILink[];
  styles?: IStyle[];
  headScripts?: IScriptConfig;
  scripts?: IScriptConfig;
}

export interface IGetContentArgs extends IHtmlConfig {
  route: IRoute;
  headJSFiles?: string[];
  jsFiles?: string[];
  cssFiles?: string[];
  tplPath?: string;
}
