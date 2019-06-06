export default function findRoute(routes, path) {
  const flatRoutes = [];
  const getFlatRoutes = list => {
    if (!list) {
      return;
    }
    list.forEach(item => {
      if (item.routes) {
        getFlatRoutes(item.routes);
      }
      if (item.path && !flatRoutes.includes(item.path)) {
        const { routes, ...itemRest } = item;
        flatRoutes.push(itemRest);
      }
    });
  };
  getFlatRoutes(routes);
  return flatRoutes.find(route => require('react-router-dom').matchPath(path, route));
}
