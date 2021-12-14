import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteContext } from './routeContext';
import { IRoute, IRoutesById } from './types';

export function createClientRoutes(opts: {
  routesById: IRoutesById;
  parentId?: string;
  Component: any;
}) {
  const { routesById, parentId, Component } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute({
        route: routesById[id],
        Component,
      });
      const children = createClientRoutes({
        routesById,
        parentId: route.id,
        Component,
      });
      if (children.length > 0) {
        // @ts-ignore
        route.children = children;
        // TODO: remove me
        // compatible with @ant-design/pro-layout
        // @ts-ignore
        route.routes = children;
      }
      return route;
    });
}

export function createClientRoute(opts: { route: IRoute; Component: any }) {
  const { route, Component } = opts;
  const { id, path, index, redirect, ...props } = route;
  return {
    id: id,
    path: path,
    index: index,
    element: redirect ? (
      <Navigate to={redirect} />
    ) : (
      <RouteContext.Provider
        value={{
          route: opts.route,
        }}
      >
        <Component id={id} />
      </RouteContext.Provider>
    ),
    ...props,
  };
}
