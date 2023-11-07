import {IServerLoaderArgs} from "./ssr";

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

export type ServerLoader = (req: IServerLoaderArgs) => Promise<any>;
export type MetadataLoader = (serverLoaderData: any, req: IServerLoaderArgs) => Promise<any>;
