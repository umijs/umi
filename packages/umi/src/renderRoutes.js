import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

function withRoute(Route) {
  return ComponentToWrap => {
    return props => {
      return (
        <Route {...props}>
          <ComponentToWrap {...props} />
        </Route>
      );
    };
  };
}

export default function renderRoutes(
  routes,
  extraProps = {},
  switchProps = {},
) {
  return routes ? (
    <Switch {...switchProps}>
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
        let R = Route;
        if (route.Routes) {
          R = props => {
            const { render, ...rest } = props;
            return <>{render(rest)}</>;
          };
          let len = route.Routes.length - 1;
          while (len >= 0) {
            R = withRoute(route.Routes[len])(R);
            len -= 1;
          }
        }
        return (
          <R
            key={route.key || i}
            path={route.path}
            exact={route.exact}
            strict={route.strict}
            route={route}
            render={props => {
              const childRoutes = renderRoutes(
                route.routes,
                {} /* extraProps */,
                {
                  /* switchProps */
                  location: props.location,
                },
              );
              if (route.component) {
                const compatProps = {};
                if (__UMI_BIGFISH_COMPAT) {
                  if (
                    props.match &&
                    props.match.params &&
                    !props.params &&
                    !extraProps.params
                  ) {
                    compatProps.params = props.match.params;
                  }
                }
                return (
                  <route.component
                    {...props}
                    {...extraProps}
                    {...compatProps}
                    route={route}
                  >
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
    </Switch>
  ) : null;
}
