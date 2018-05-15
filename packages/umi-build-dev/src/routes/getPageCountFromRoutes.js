let targetLevel = null;
let level = 0;

export default function(routes) {
  if (process.env.CODE_SPLITTING_LEVEL) {
    targetLevel = process.env.CODE_SPLITTING_LEVEL;
  } else {
    targetLevel = 1;
    const rootRoute = routes.filter(route => route.path === '/')[0];
    if (rootRoute && rootRoute.routes) {
      targetLevel = 2;
    }
  }

  return countRoutes(routes);
}

function countRoutes(routes) {
  level += 1;
  const ret = routes.reduce((memo, route) => {
    if (level <= targetLevel) {
      if (route.routes) {
        memo += countRoutes(route.routes) + 1;
      } else {
        memo += 1;
      }
    }
    return memo;
  }, 0);
  level -= 1;
  return ret;
}
