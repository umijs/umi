import React from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import NotLiveRoute from 'react-live-route';

const LiveRoute = withRouter(NotLiveRoute);
const RouteInstanceMap = {
  get(key) {
    return key._routeInternalComponent;
  },
  has(key) {
    return key._routeInternalComponent !== undefined;
  },
  set(key, value) {
    key._routeInternalComponent = value;
  },
};

// Support pass props from layout to child routes
const RouteWithProps = ({
  path,
  exact,
  strict,
  render,
  location,
  sensitive,
  keepAlive,
  ...rest
}) => {
  if (keepAlive) {
    return (
      <LiveRoute
        path={path}
        exact={exact}
        strict={strict}
        location={location}
        alwaysLive={true}
        sensitive={sensitive}
        render={props => render({ ...props, ...rest })}
      />
    );
  }
  return (
    <Route
      path={path || '/umi404'}
      exact={exact}
      strict={strict}
      location={location}
      sensitive={sensitive}
      render={props => render({ ...props, ...rest })}
    />
  );
};

function getCompatProps(props) {
  const compatProps = {};
  if (__UMI_BIGFISH_COMPAT) {
    if (props.match && props.match.params && !props.params) {
      compatProps.params = props.match.params;
    }
  }
  return compatProps;
}

function withRoutes(route) {
  if (RouteInstanceMap.has(route)) {
    return RouteInstanceMap.get(route);
  }

  const { Routes } = route;
  let len = Routes.length - 1;
  let Component = args => {
    const { render, ...props } = args;
    return render(props);
  };
  while (len >= 0) {
    const AuthRoute = Routes[len];
    const OldComponent = Component;
    Component = props => (
      <AuthRoute {...props}>
        <OldComponent {...props} />
      </AuthRoute>
    );
    len -= 1;
  }

  const ret = args => {
    const { render, ...rest } = args;
    return (
      <RouteWithProps
        {...rest}
        render={props => {
          return <Component {...props} route={route} render={render} />;
        }}
      />
    );
  };
  RouteInstanceMap.set(route, ret);
  return ret;
}

export default function renderRoutes(
  routes,
  extraProps = {},
  switchProps = {},
) {
  return routes ? (
    <div {...switchProps}>
      {routes.map((route, i) => {
        if (route.redirect) {
          return (
            <Redirect
              key={route.key || i}
              from={route.path}
              to={route.redirect}
              exact={route.exact}
              strict={route.strict}
            />
          );
        }
        const RouteRoute = route.Routes ? withRoutes(route) : RouteWithProps;
        return (
          <RouteRoute
            key={route.key || i}
            path={route.path}
            exact={route.exact}
            strict={route.strict}
            sensitive={route.sensitive}
            keepAlive={route.keepAlive}
            render={props => {
              const childRoutes = renderRoutes(
                route.routes,
                {},
                {
                  location: props.location,
                },
              );
              if (route.component) {
                const compatProps = getCompatProps({
                  ...props,
                  ...extraProps,
                });
                const newProps = window.g_plugins.apply('modifyRouteProps', {
                  initialValue: {
                    ...props,
                    ...extraProps,
                    ...compatProps,
                  },
                  args: { route },
                });
                return (
                  <route.component {...newProps} route={route}>
                    {childRoutes}
                  </route.component>
                );
              } else {
                return childRoutes;
              }
            }}
          />
        );
      })}
    </div>
  ) : null;
}
