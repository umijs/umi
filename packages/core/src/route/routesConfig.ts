import assert from 'assert';

interface IOpts {
  routes: any[];
  onResolveComponent?: (component: string) => string;
}

interface IMemo {
  id: number;
  ret: any;
}

export function getConfigRoutes(opts: IOpts): any[] {
  const memo: IMemo = { ret: {}, id: 1 };
  transformRoutes({
    routes: opts.routes,
    parentId: undefined,
    memo,
    onResolveComponent: opts.onResolveComponent,
  });
  return memo.ret;
}

function transformRoutes(opts: {
  routes: any[];
  parentId: undefined | string;
  memo: IMemo;
  onResolveComponent?: Function;
}) {
  opts.routes.forEach((route) => {
    transformRoute({
      route,
      parentId: opts.parentId,
      memo: opts.memo,
      onResolveComponent: opts.onResolveComponent,
    });
  });
}

function transformRoute(opts: {
  route: any;
  parentId: undefined | string;
  memo: IMemo;
  onResolveComponent?: Function;
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
    absPath = endsWithStar(parentAbsPath)
      ? parentAbsPath
      : ensureWithSlash(parentAbsPath, absPath);
  }
  opts.memo.ret[id] = {
    ...routeProps,
    path: opts.route.path,
    ...(component
      ? {
          file: opts.onResolveComponent
            ? opts.onResolveComponent(component)
            : component,
        }
      : {}),
    parentId: opts.parentId,
    id,
  };
  if (absPath) {
    opts.memo.ret[id].absPath = absPath;
  }
  if (wrappers?.length) {
    let parentId = opts.parentId;
    let path = opts.route.path;
    let layout = opts.route.layout;
    wrappers.forEach((wrapper: any) => {
      const { id } = transformRoute({
        route: {
          path,
          component: wrapper,
          isWrapper: true,
          ...(layout === false ? { layout: false } : {}),
        },
        parentId,
        memo: opts.memo,
        onResolveComponent: opts.onResolveComponent,
      });
      parentId = id;
      path = endsWithStar(path) ? '*' : '';
    });
    opts.memo.ret[id].parentId = parentId;
    opts.memo.ret[id].path = path;
    // wrapper 处理后 真实 path 为空, 存储原 path 为 originPath 方便 layout 渲染
    opts.memo.ret[id].originPath = opts.route.path;
  }
  if (opts.route.routes) {
    transformRoutes({
      routes: opts.route.routes,
      parentId: id,
      memo: opts.memo,
      onResolveComponent: opts.onResolveComponent,
    });
  }
  return { id };
}

function endsWithStar(str: string) {
  return str.endsWith('*');
}

function ensureWithSlash(left: string, right: string) {
  // right path maybe empty
  if (!right?.length || right === '/') {
    return left;
  }
  return `${left.replace(/\/+$/, '')}/${right.replace(/^\/+/, '')}`;
}
