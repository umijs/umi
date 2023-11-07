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


export { ServerLoader, MetadataLoader } from './ssr';

export type UmiRequest = Partial<Request> & Pick<Request, 'url' | 'headers'>;

/**
 * serverLoader 的参数类型
 */
export interface IServerLoaderArgs {
  request: UmiRequest;
}
