import React, { useEffect, useState } from 'react';
import { Plugin, Redirect } from '@umijs/runtime';
import { IRoute } from '..';
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

/**
 * A flag indicating the route changed or not
 */
let routeChanged = false;

function wrapInitialPropsFetch(Component: any) {
  function ComponentWithInitialPropsFetch(props: object) {
    const [initialProps, setInitialProps] = useState(() => window.g_initialProps);

    useEffect(() => {
      (async () => {
        const initialProps = await Component!.getInitialProps!({
          isServer: false,
          match: props?.match,
        });
        setInitialProps(initialProps);
      })();
      return () => {
        routeChanged = true;
      }
    }, []);
    return <Component {...props} {...initialProps} />;
  };
  // A const static value marking itself as wrapped
  ComponentWithInitialPropsFetch.wrappedWithInitialProps = true;
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
    // @ts-ignore
    if (process.env.__IS_BROWSER && Component.getInitialProps && !Component?.wrappedWithInitialProps) {
      Component = wrapInitialPropsFetch(Component);
      route.component = Component;
    }

    const newProps = {
      ...props,
      ...opts.extraProps,
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
