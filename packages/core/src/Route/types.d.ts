export interface IRoute {
  component?: string;
  exact?: boolean;
  path?: string;
  routes?: IRoute[];
  __toMerge?: boolean;
  __isDynamic?: boolean;
}
