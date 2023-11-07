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
export type MetadataLoader<T = any> = (
  serverLoaderData: T,
  req?: IServerLoaderArgs,
) => LoaderReturn<IMetadata>;
