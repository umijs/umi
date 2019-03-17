import { RouteComponentProps, RouteProps, match } from 'react-router-dom';

type IncludeRoute = 'component' | 'exact' | 'path';

type RouteType = Pick<RouteProps, IncludeRoute>;

export default interface RouterTypes extends RouteComponentProps {
  computedMatch?: match;
  route?: Pick<RouteProps, IncludeRoute>;
}
