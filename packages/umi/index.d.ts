import { withRouter, RouteComponentProps, RouteProps, match } from 'react-router-dom';

export { default as Link } from './link';
export { default as NavLink } from './navlink';
export { default as Redirect } from './redirect';

export { default as dynamic } from './dynamic';
export { default as router } from './router';
export { default as withRouter } from './withRouter';

type IncludeRoute = 'component' | 'exact' | 'path';

interface RouteType extends Pick<RouteProps, IncludeRoute> {
  _title?: string;
  _title_default?: string;
}

export interface RouterTypes extends RouteComponentProps {
  computedMatch?: match;
  route?: RouteType;
}
