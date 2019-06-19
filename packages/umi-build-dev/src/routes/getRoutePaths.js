import { uniq } from 'lodash';

export default function getRoutePaths(routes) {
  return uniq(
    routes.reduce((memo, route) => {
      if (route.path) {
        memo.push(route.path);
        if (route.routes) {
          memo = memo.concat(getRoutePaths(route.routes));
        }
      }
      return memo;
    }, []),
  );
}
