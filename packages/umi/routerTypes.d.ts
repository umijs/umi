import { RouteComponentProps as BasicRouteProps, RouteProps, match } from 'react-router-dom';

type IncludeRoute = 'component' | 'exact' | 'path';

type RouteType = Pick<RouteProps, IncludeRoute>;

export default interface RouterTypes<T extends Object = {}, P = {}> extends BasicRouteProps {
  computedMatch?: match<P>;
  route?: RouteType & T;
}
