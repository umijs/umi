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

function wrapInitialPropsFetch(Component: any) {
  return function ComponentWithInitialPropsFetch(props: object) {
    const [initialProps, setInitialProps] = useState();
    useEffect(() => {
      (async () => {
        const initialProps = await Component!.getInitialProps!();
        setInitialProps(initialProps);
      })();
    }, []);
    return <Component {...props} {...initialProps} />;
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

  let { component: Component, wrappers } = route;
  if (Component) {
    if (Component.getInitialProps) {
      Component = wrapInitialPropsFetch(Component);
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
