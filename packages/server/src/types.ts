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
