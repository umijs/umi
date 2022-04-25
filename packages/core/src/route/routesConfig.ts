import assert from 'assert';

interface IOpts {
  routes: any[];
}

interface IMemo {
  id: number;
  ret: any;
}

export function getConfigRoutes(opts: IOpts): any[] {
  const memo: IMemo = { ret: {}, id: 1 };
  transformRoutes({ routes: opts.routes, parentId: undefined, memo });
  return memo.ret;
}

function transformRoutes(opts: {
  routes: any[];
  parentId: undefined | string;
  memo: IMemo;
}) {
  opts.routes.forEach((route) => {
    transformRoute({ route, parentId: opts.parentId, memo: opts.memo });
  });
}

function transformRoute(opts: {
  route: any;
  parentId: undefined | string;
  memo: IMemo;
}) {
  assert(
    !opts.route.children,
    'children is not allowed in route props, use routes instead.',
  );
  const id = String(opts.memo.id++);
  const { routes, component, wrappers, ...routeProps } = opts.route;
  let absPath = opts.route.path;
  if (absPath?.charAt(0) !== '/') {
    const parentAbsPath = opts.parentId
      ? opts.memo.ret[opts.parentId].absPath.replace(/\/+$/, '/') // to remove '/'s on the tail
      : '/';
    absPath = parentAbsPath + absPath;
  }
  opts.memo.ret[id] = {
    ...routeProps,
    path: opts.route.path,
    ...(component ? { file: component } : {}),
    parentId: opts.parentId,
    id,
  };
  if (absPath) {
    opts.memo.ret[id].absPath = absPath;
  }
  if (wrappers?.length) {
    let parentId = opts.parentId;
    let path = opts.route.path;
    wrappers.forEach((wrapper: any) => {
      const { id } = transformRoute({
        route: { path, component: wrapper },
        parentId,
        memo: opts.memo,
      });
      parentId = id;
      path = '';
    });
    opts.memo.ret[id].parentId = parentId;
    opts.memo.ret[id].path = path;
  }
  if (opts.route.routes) {
    transformRoutes({
      routes: opts.route.routes,
      parentId: id,
      memo: opts.memo,
    });
  }
  return { id };
}
