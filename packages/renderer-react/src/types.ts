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

export interface IRoutesById {
  [id: string]: IRoute;
}

export interface IRouteComponents {
  [id: string]: any;
}

export interface ILoaderData {
  [routeKey: string]: any;
}
