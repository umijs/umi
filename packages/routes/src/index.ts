import { lodash } from '@umijs/utils';
import { IRoute, IConfig } from '@umijs/types';
import assert from 'assert';
import getConventionalRoutes from './getConventionalRoutes';
import routesToJSON from './routesToJSON';

interface IOpts {
  onPatchRoutesBefore?: Function;
  onPatchRoutes?: Function;
  onPatchRouteBefore?: Function;
  onPatchRoute?: Function;
}

class Route {
  opts: IOpts;
  constructor(opts?: IOpts) {
    this.opts = opts || {};
  }

  getRoutes({
    config,
    root,
    componentPrefix,
  }: {
    config: IConfig;
    root?: string;
    componentPrefix?: string;
  }) {
    let routes = config.routes;
    if (!routes) {
      assert(root, `opts.root must be supplied for conventional routes.`);
      routes = this.getConventionRoutes({ root: root!, componentPrefix });
    }
    this.patchRoutes(routes);
    return routes;
  }

  // TODO:
  // 1. 移动 /404 到最后，并处理 component 和 redirect
  // 2. exportStatic 时同步 / 到 /index.html
  patchRoutes(routes: IRoute[]) {
    routes.forEach(route => {
      this.patchRoute(route);
    });
    if (this.opts.onPatchRoutes) {
      this.opts.onPatchRoutes({
        routes,
      });
    }
  }

  // TODO:
  // 1. exportStatic.htmlSuffix 时修改配置 /foo 为 /foo.html
  patchRoute(route: IRoute) {
    if (this.opts.onPatchRoute) {
      this.opts.onPatchRoute({
        route,
      });
    }
    if (route.routes) {
      this.patchRoutes(route.routes);
    }
  }

  getConventionRoutes(opts: any): IRoute[] {
    return getConventionalRoutes(opts);
  }

  getJSON({ routes }: { routes: IRoute[] }) {
    return routesToJSON({ routes });
  }

  getPaths({ routes }: { routes: IRoute[] }): string[] {
    return lodash.uniq(
      routes.reduce((memo: string[], route) => {
        if (route.path) memo.push(route.path);
        if (route.routes)
          memo = memo.concat(this.getPaths({ routes: route.routes }));
        return memo;
      }, []),
    );
  }
}

export { Route };
