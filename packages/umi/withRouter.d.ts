import { withRouter, RouteComponentProps, RouteProps, match } from 'react-router-dom';

type IncludeRoute = 'component' | 'exact' | 'path';

interface RouteType extends Pick<RouteProps, IncludeRoute> {
  _title?: string;
  _title_default?: string;
}

export interface RouterTypes extends RouteComponentProps {
  computedMatch?: match;
  route?: RouteType;
}

export default withRouter;
