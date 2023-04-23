export interface IRoute {
  id: string;
  path?: string;
  index?: boolean;
  parentId?: string;
  redirect?: string;
}

export interface IRoutesById {
  [id: string]: IRoute;
}

export interface IRouteComponents {
  [id: string]: any;
}
