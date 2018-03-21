import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from '<%= libraryName %>/dynamic';
import renderRoutes from '<%= libraryName %>/_renderRoutes';
<%= IMPORT %>

let Router = DefaultRouter;
<%= ROUTER_MODIFIER %>

const routes = <%= ROUTES %>;

export default function() {
  return (
<%= ROUTER %>
  );
}
