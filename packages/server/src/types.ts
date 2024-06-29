export interface IOpts {
  base: string;
  routes: Record<
    string,
    {
      path: string;
      file: string;
      id: string;
      parentId?: string;
    }
  >;
  links?: Record<string, string>[];
  metas?: Record<string, string>[];
  styles?: (Record<string, string> | string)[];
  favicons?: string[];
  title?: string;
  headScripts?: (Record<string, string> | string)[];
  scripts?: (Record<string, string> | string)[];
  mountElementId?: string;
  esmScript?: boolean;
  modifyHTML?: (html: string, args: { path?: string }) => Promise<string>;
  historyType?: 'hash' | 'browser';
}

export type IUserExtraRoute = string | { path: string; prerender: boolean };

export interface IRoute {
  id: string;
  path?: string;
  index?: boolean;
  parentId?: string;
}

export interface IRoutesById {
  [id: string]: IRoute;
}

export interface IRouteCustom extends IRoute {
  [key: string]: any;
}

type LoaderReturn<T> = T | Promise<T>;

export type UmiRequest = Partial<Request> & Pick<Request, 'url' | 'headers'>;
export interface IServerLoaderArgs {
  request: UmiRequest;
}
export type ServerLoader<T = any> = (
  req?: IServerLoaderArgs,
) => LoaderReturn<T>;

export interface IMetaTag {
  name: string;
  content: string;
}
export interface IMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  /**
   * @default 'en'
   */
  lang?: string;
  metas?: IMetaTag[];
}

export interface IhtmlPageOpts extends IMetadata {
  headScripts?: (Record<string, string> | string)[];
  links?: Record<string, string>[];
  styles?: string[];
  favicons?: string[];
  scripts?: (Record<string, string> | string)[];
  [key: string]: any;
}

export type MetadataLoader<T = any> = (
  serverLoaderData: T,
  req?: IServerLoaderArgs,
) => LoaderReturn<IMetadata>;
