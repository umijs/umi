import React from 'react';
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
      }
      return route;
    });
}

export function createClientRoute(opts: { route: IRoute; Component: any }) {
  const { route, Component } = opts;
  return {
    id: route.id,
    path: route.path,
    index: route.index,
    element: <Component id={route.id} />,
  };
}
