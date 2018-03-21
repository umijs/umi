import React from 'react';
import { Switch, Route } from 'react-router-dom';

export default function renderRoutes(
  routes,
  extraProps = {},
  switchProps = {},
) {
  return routes ? (
    <Switch {...switchProps}>
      {routes.map((route, i) => {
        return (
          <Route
            key={route.key || i}
            path={route.path}
            exact={route.exact}
            strict={route.strict}
            render={props => {
              return (
                <route.component {...props} {...extraProps} route={route}>
                  {renderRoutes(route.routes)}
                </route.component>
              );
            }}
          />
        );
      })}
    </Switch>
  ) : null;
}
