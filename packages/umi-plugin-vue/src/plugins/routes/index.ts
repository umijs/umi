import getRouteConfigFromDir from './getRouteConfigFromDir';
import excludeRoute from './excludeRoute';
import { optsToArray } from '../../utils';

export default function(api, opts = { exclude: [] }) {
  const { paths } = api;

  api.modifyRoutes(memo => {
    return excludeRoute(getRouteConfigFromDir(paths), optsToArray(opts.exclude));
  });
}
