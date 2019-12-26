import React, { useEffect, useState } from 'react';
import { Plugin, Redirect } from '@umijs/runtime';
import { IRoute } from './types';
import Switch from './Switch';
import Route from './Route';

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

function wrapInitialPropsFetch(WrappedComponent: any) {
  return function Foo(props: object) {
    const [initialProps, setInitialProps] = useState();
    useEffect(() => {
      (async () => {
        const initialProps = await WrappedComponent!.getInitialProps!();
        setInitialProps(initialProps);
      })();
    }, []);
    return <WrappedComponent {...props} {...initialProps} />;
  };
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

  let { component: Component, Routes } = route;
  if (Component) {
    if (Component.getInitialProps) {
      Component = wrapInitialPropsFetch(Component);
    }

    if (Routes) {
      // TODO: Routes 更名
      // TODO: 用 Routes 封装 Component
    }

    const newProps = {
      ...props,
      route,
    };
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
    sensitive: route.sensitive,
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
