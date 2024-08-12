{{{ headerImports }}}

export async function getRoutes() {
  const routes = {{{ routes }}} as const;
  const allPathRoutes = {{{ allPathRoutes }}} as const;
  return {
    routes,
    allPathRoutes,
    routeComponents: {{{ routeComponents }}},
  };
}
