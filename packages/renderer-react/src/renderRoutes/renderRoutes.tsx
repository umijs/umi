import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Plugin, Redirect, ApplyPluginsType } from '@umijs/runtime';
import { IRoute, IComponent } from '..';
import Switch from './Switch';
import Route from './Route';

interface IOpts {
  routes: IRoute[];
  plugin: Plugin;
  extraProps?: object;
  pageInitialProps?: object;
  getInitialPropsCtx?: object;
}

interface IGetRouteElementOpts {
  route: IRoute;
  index: number;
  opts: IOpts;
}

function wrapInitialPropsFetch(route: IRoute, opts: IOpts): IComponent {
  const { component, ...restRouteParams } = route;
  let Component: any = route!.component;
  function ComponentWithInitialPropsFetch(props: any) {
    const [initialProps, setInitialProps] = useState(
      () => (window as any).g_initialProps,
    );

    useEffect(() => {
      /**
       * 1. 首次渲染时，此时 window.g_initialProps 变量存在，不需要再走一次 getInitialProps，这样一次 SSR 就走了 2 次 getInitialProps
       * 2. 但是路由切换时，window.getInitialProps 会被赋为 null，这时候就走 getInitialProps 逻辑
       * 3. 如果任何时候都走 2 次，配置 forceInitial: true，这个场景用于静态站点的首屏加载希望走最新数据
       * 4. 开启动态加载后，会在执行 getInitialProps 前预加载下
       */
      if (!(window as any).g_initialProps) {
        (async () => {
          // preload when enalbe dynamicImport
          if (Component.preload) {
            const preloadComponent = await Component.preload();
            // for test case, really use .default
            Component = preloadComponent.default || preloadComponent;
          }
          const ctx = {
            isServer: false,
            match: props?.match,
            ...(opts.getInitialPropsCtx || {}),
            ...restRouteParams,
          };
          if (Component?.getInitialProps) {
            const { modifyGetInitialPropsCtx } = opts.plugin.applyPlugins({
              key: 'ssr',
              type: ApplyPluginsType.modify,
              initialValue: {},
            });
            if (typeof modifyGetInitialPropsCtx === 'function') {
              modifyGetInitialPropsCtx(ctx);
            }

            const initialProps = await Component!.getInitialProps!(ctx);
            setInitialProps(initialProps);
          }
        })();
      }
    }, [window.location.pathname, window.location.search]);
    return <Component {...props} {...initialProps} />;
  }
  // flag for having wrappered
  ComponentWithInitialPropsFetch.wrapInitialPropsLoaded = true;
  ComponentWithInitialPropsFetch.displayName = 'ComponentWithInitialPropsFetch';
  return ComponentWithInitialPropsFetch;
}

// TODO: custom Switch
// 1. keep alive
function render({
  route,
  opts,
  props,
}: {
  route: IRoute;
  opts: IOpts;
  props: object;
}) {
  const routes = renderRoutes({
    ...opts,
    routes: route.routes || [],
  });
  let { component: Component, wrappers } = route;
  if (Component) {
    const defaultPageInitialProps = process.env.__IS_SERVER
      ? {}
      : (window as any).g_initialProps;
    const newProps = {
      ...props,
      ...opts.extraProps,
      ...(opts.pageInitialProps || defaultPageInitialProps),
      route,
    };
    // @ts-ignore
    let ret = <Component {...newProps}>{routes}</Component>;

    // route.wrappers
    if (wrappers) {
      let len = wrappers.length - 1;
      while (len >= 0) {
        ret = React.createElement(wrappers[len], newProps, ret);
        len -= 1;
      }
    }

    return ret;
  } else {
    return routes;
  }
}

function getRouteElement({ route, index, opts }: IGetRouteElementOpts) {
  const routeProps = {
    key: route.key || index,
    exact: route.exact,
    strict: route.strict,
    sensitive: route.sensitive,
    path: route.path,
  };
  if (route.redirect) {
    return <Redirect {...routeProps} from={route.path} to={route.redirect} />;
  } else {
    // avoid mount and unmount with url hash change
    if (
      !process.env.__IS_SERVER &&
      // make sure loaded once
      !route.component?.wrapInitialPropsLoaded &&
      (route.component?.getInitialProps || route.component?.preload)
    ) {
      // client Render for enable ssr, but not sure SSR success
      route.component = wrapInitialPropsFetch(route, opts);
    }
    return (
      <Route
        {...routeProps}
        render={(props: object) => {
          return render({ route, opts, props });
        }}
      />
    );
  }
}

export default function renderRoutes(opts: IOpts) {
  return opts.routes ? (
    <Switch>
      {opts.routes.map((route, index) =>
        getRouteElement({
          route,
          index,
          opts,
        }),
      )}
    </Switch>
  ) : null;
}
