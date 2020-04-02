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

export interface IRouteComponentProps {
  children: JSX.Element;
  location: Location;
  route: IRoute;
  history: History;
  match: match;
}

export { default as renderClient } from './renderClient/renderClient';
export { default as renderRoutes } from './renderRoutes/renderRoutes';
