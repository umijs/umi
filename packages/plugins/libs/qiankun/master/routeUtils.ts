interface Route extends Record<string, any> {
  routes?: Route[];
  microApp?: string;
}

export function deepFilterLeafRoutes(routeTree: Route[]) {
  const leafRoutes: Route[] = [];

  const findLeafRoutes = (routes: Route[]) => {
    for (let i = 0; i < routes.length; i++) {
      const r = routes[i];
      if (r?.routes) {
        findLeafRoutes(r?.routes);
      }
      leafRoutes.push(r);
    }
  };

  findLeafRoutes(routeTree);

  return leafRoutes.filter((r) => r.microApp);
}
