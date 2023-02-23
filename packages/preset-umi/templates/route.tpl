{{{ headerImports }}}

export async function getRoutes() {
  const routes = {{{ routes }}} as const;
  return {
    routes,
    routeComponents: {{{ routeComponents }}},
  };
}
