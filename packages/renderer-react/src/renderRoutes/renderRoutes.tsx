import { ApplyPluginsType, Plugin, Redirect } from '@umijs/runtime';
import React, { createElement, useEffect, useState } from 'react';
import { IComponent, IRoute } from '..';
import Route from './Route';
import Switch from './Switch';

interface IOpts {
  routes: IRoute[];
  plugin: Plugin;
  extraProps?: object;
  pageInitialProps?: object;
  getInitialPropsCtx?: object;
  isServer?: boolean;
  ssrProps?: object;
  rootRoutes?: IRoute[];
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
      const handleGetInitialProps = async () => {
        // preload when enalbe dynamicImport
        let preloadComponent: any = Component;
        if (Component.preload) {
          preloadComponent = await Component.preload();
          // for test case, really use .default
          preloadComponent = preloadComponent.default || preloadComponent;
        }
        const defaultCtx = {
          isServer: false,
          match: props?.match,
          history: props?.history,
          route,
          ...(opts.getInitialPropsCtx || {}),
          ...restRouteParams,
        };
        if (preloadComponent?.getInitialProps) {
          const ctx = await opts.plugin.applyPlugins({
            key: 'ssr.modifyGetInitialPropsCtx',
            type: ApplyPluginsType.modify,
            initialValue: defaultCtx,
            async: true,
          });

          const initialProps = await preloadComponent!.getInitialProps!(
            ctx || defaultCtx,
          );
          setInitialProps(initialProps);
        }
      };
      // null 时，一定会触发 getInitialProps 执行
      if (!(window as any).g_initialProps) {
        handleGetInitialProps();
      }
    }, [window.location.pathname, window.location.search]);
    return <Component {...props} {...initialProps} />;
  }
  // flag for having wrappered
  ComponentWithInitialPropsFetch.wrapInitialPropsLoaded = true;
  ComponentWithInitialPropsFetch.displayName = 'ComponentWithInitialPropsFetch';
  return ComponentWithInitialPropsFetch;
}

function render({
  route,
  opts,
  props,
}: {
  route: IRoute;
  opts: IOpts;
  props: any;
}) {
  const routes = renderRoutes(
    {
      ...opts,
      routes: route.routes || [],
      rootRoutes: opts.rootRoutes,
    },
    { location: props.location },
  );
  let { component: Component, wrappers } = route;
  if (Component) {
    const defaultPageInitialProps = opts.isServer
      ? {}
      : (window as any).g_initialProps;
    const newProps = {
      ...props,
      ...opts.extraProps,
      ...(opts.pageInitialProps || defaultPageInitialProps),
      route,
      routes: opts.rootRoutes,
    };
    // @ts-ignore
    let ret = <Component {...newProps}>{routes}</Component>;

    // route.wrappers
    if (wrappers) {
      let len = wrappers.length - 1;
      while (len >= 0) {
        ret = createElement(wrappers[len], newProps, ret);
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
      // only when SSR config enable
      opts.ssrProps &&
      !opts.isServer &&
      // make sure loaded once
      !(route.component as any)?.wrapInitialPropsLoaded &&
      // TODO need a type
      ((route.component as any)?.getInitialProps ||
        (route.component as any)?.preload)
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

export default function renderRoutes(opts: IOpts, switchProps = {}) {
  return opts.routes ? (
    <Switch {...switchProps}>
      {opts.routes.map((route, index) =>
        getRouteElement({
          route,
          index,
          opts: {
            ...opts,
            rootRoutes: opts.rootRoutes || opts.routes,
          },
        }),
      )}
    </Switch>
  ) : null;
}
