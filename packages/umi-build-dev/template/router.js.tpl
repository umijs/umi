import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from '<%= libraryName %>/dynamic';
import renderRoutes from '<%= libraryName %>/_renderRoutes';
import getRouteMatchers from '<%= libraryName %>/_routeMatchers';
<%= IMPORT %>

let Router = DefaultRouter;
<%= ROUTER_MODIFIER %>

let routes = <%= ROUTES %>;
<%= ROUTES_MODIFIER %>

export default function() {
  const pathnameMatcher = getRouteMatchers(routes);
  return (
<%= ROUTER %>
  );
}
