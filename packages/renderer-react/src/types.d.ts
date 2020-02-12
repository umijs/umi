import { FunctionComponent } from 'react';

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
