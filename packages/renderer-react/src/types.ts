export interface IRoute {
  id: string;
  path?: string;
  index?: boolean;
  parentId?: string;
  redirect?: string;
  clientLoader?: () => Promise<any>;
  hasServerLoader?: boolean;
}

export interface IClientRoute {
  id: string;
  element: React.ReactNode;
  children?: IClientRoute[];
  // compatible with @ant-design/pro-layout
  routes?: IClientRoute[];
  path?: string;
  index?: boolean;
  parentId?: string;
  clientLoader?: () => Promise<any>;
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
