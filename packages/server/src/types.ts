export interface IRoute {
  id: string;
  path?: string;
  index?: boolean;
  parentId?: string;
  name?: string;
  originPath?: string;
}

export interface IRoutesById {
  [id: string]: IRoute;
}
