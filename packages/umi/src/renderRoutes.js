import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

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
        const RouteRoute = route.Route || Route;
        return (
          <RouteRoute
            key={route.key || i}
            path={route.path}
            exact={route.exact}
            strict={route.strict}
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
                if (process.env.BIGFISH_COMPAT) {
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
