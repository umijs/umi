import { RouteComponentProps, RouteProps, match } from 'react-router-dom';

type IncludeRoute = 'component' | 'exact' | 'path';

type RouteType = Pick<RouteProps, IncludeRoute>;

export default interface RouterTypes<T extends Object = {}> extends RouteComponentProps {
  computedMatch?: match;
  route?: RouteType & T;
}
