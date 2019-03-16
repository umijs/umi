import { withRouter, RouteComponentProps, RouteProps, match } from 'react-router-dom';

interface RouteTypes extends Pick<RouteProps, 'component' | 'exact' | 'path'> {
  _title?: string;
  _title_default?: string;
}

export interface RouterTypes extends RouteComponentProps {
  computedMatch?: match;
  route?: RouteTypes;
}

export default withRouter;
