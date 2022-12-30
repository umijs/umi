export interface IRouteSSRProps {
  clientLoader?: () => Promise<any>;
  hasServerLoader?: boolean;
}

export interface IRoute extends IRouteSSRProps {
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
