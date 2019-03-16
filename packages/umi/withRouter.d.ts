import { withRouter, RouteComponentProps, RouteProps, match } from 'react-router-dom';

type ExcludeRoute = 'component' | 'exact' | 'path';

interface RouteType extends Pick<RouteProps, ExcludeRoute> {
  _title?: string;
  _title_default?: string;
}

export interface RouterTypes extends RouteComponentProps {
  computedMatch?: match;
  route?: RouteType;
}

export default withRouter;
