import React from 'react';
import { Plugin, Switch, Route, Redirect } from '@umijs/runtime';
import { IRoute } from './types';

interface IOpts {
  routes: IRoute[];
  plugin: Plugin;
  extraProps?: object;
}

interface IGetRouteElementOpts {
  route: IRoute;
  index: number;
  opts: IOpts;
}

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

  let { component: Component, Routes } = route;
  const newProps = {
    ...props,
    ...opts.extraProps,
    route,
  };
  if (Component) {
    if (Component.getInitialProps) {
      // TODO: 封装 Component，处理路由切换时的 getInitialProps
    }
    if (Routes) {
      // TODO: Routes 更名
      // TODO: 用 Routes 封装 Component
    }
    return <Component {...newProps}>{routes}</Component>;
  } else {
    return routes;
  }
}

function getRouteElement({ route, index, opts }: IGetRouteElementOpts) {
  const routeProps = {
    key: route.key || index,
    exact: route.exact,
    strict: route.strict,
    path: route.path,
  };
  if (route.redirect) {
    return <Redirect {...routeProps} from={route.path} to={route.redirect} />;
  } else {
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
