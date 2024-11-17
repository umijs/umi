import type { IhtmlPageOpts, ServerLoader } from '@umijs/server/dist/types';
import type { RouteMatch, RouteObject } from 'react-router-dom';

declare global {
  interface Window {
    __UMI_LOADER_DATA__: any;
    __UMI_METADATA_LOADER_DATA__: any;
    __UMI_BUILD_ClIENT_CSS__: any;
  }
}

type ClientLoaderFunctionArgs = {
  serverLoader: ServerLoader;
};

export type ClientLoader = ((
  args: ClientLoaderFunctionArgs,
) => Promise<any>) & {
  hydrate?: boolean;
};

export interface IRouteSSRProps {
  clientLoader?: ClientLoader;
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
  __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
    pureApp: boolean;
    pureHtml: boolean;
  };
  mountElementId?: string;
}

export interface IRootComponentOptions extends IHtmlHydrateOptions {
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  location: string;
  loaderData: { [routeKey: string]: any };
  manifest: any;
  basename?: string;
  useStream?: boolean;
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
