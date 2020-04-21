import { FunctionComponent } from 'react';
import { History, Location } from 'history-with-query';
import { match } from 'react-router-dom';

interface IComponent extends FunctionComponent {
  getInitialProps?: Function;
}

export interface IRoute {
  path?: string;
  exact?: boolean;
  redirect?: string;
  component?: IComponent;
  routes?: IRoute[];
  key?: any;
  strict?: boolean;
  sensitive?: boolean;
  wrappers?: any[];
}

export interface IRouteComponentProps<
  Params extends { [K in keyof Params]?: string } = {},
  Query extends { [K in keyof Query]?: string } = {}
> {
  children: JSX.Element;
  location: Location & { query: Query };
  route: IRoute;
  history: History;
  match: match<Params>;
}

export { default as renderClient } from './renderClient/renderClient';
export { default as renderRoutes } from './renderRoutes/renderRoutes';
