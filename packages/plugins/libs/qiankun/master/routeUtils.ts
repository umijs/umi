interface Route extends Record<string, any> {
  children: Route[];
  microApp?: string;
}

export function deepFilterLeafRoutes(routeTree: Route[]) {
  if (!routeTree?.length) {
    return [];
  }

  const leafRoutes: Route[] = [];

  const findLeafRoutes = (routes: Route[]) => {
    for (let i = 0; i < routes.length; i++) {
      const r = routes[i];
      if (r.children) {
        findLeafRoutes(r.children);
      }
      leafRoutes.push(r);
    }
  };

  findLeafRoutes(routeTree);

  return leafRoutes.filter((r) => r.microApp);
}
