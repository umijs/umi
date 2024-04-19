import type { IhtmlPageOpts } from '@umijs/server/dist/types';
import type { RouteMatch, RouteObject } from 'react-router-dom';

export interface IRouteSSRProps {
  clientLoader?: () => Promise<any>;
  hasServerLoader?: boolean;
}

export interface IRouteConventionExportProps {
  routeProps?: Record<string, any>;
}

export interface IRoute extends IRouteSSRProps, IRouteConventionExportProps {
  id: string;
  path?: string;
  index?: boolean;
  parentId?: string;
  redirect?: string;
}

export interface IClientRoute extends IRoute {
  element: React.ReactNode;
  children?: IClientRoute[];
  // compatible with @ant-design/pro-layout
  routes?: IClientRoute[];
}

export interface ISelectedRoute extends IRoute, RouteObject {}

export interface ISelectedRoutes extends RouteMatch {
  route: ISelectedRoute;
}

export interface IRoutesById {
  [id: string]: IRoute;
}

export interface IRouteComponents {
  [id: string]: any;
}

export interface ILoaderData {
  [routeKey: string]: any;
}

interface IHtmlHydrateOptions {
  htmlPageOpts?: IhtmlPageOpts;
  renderFromRoot?: boolean;
  mountElementId?: string;
}

export interface IRootComponentOptions extends IHtmlHydrateOptions {
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  location: string;
  loaderData: { [routeKey: string]: any };
  manifest: any;
}

export interface IHtmlProps extends IHtmlHydrateOptions {
  children?: React.ReactNode;
  loaderData?: { [routeKey: string]: any };
  manifest?: any;
}

export type IScript =
  | Partial<{
      async: boolean;
      charset: string;
      content: string;
      crossOrigin: string | null;
      defer: boolean;
      src: string;
      type: string;
    }>
  | string;
