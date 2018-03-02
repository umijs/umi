import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from '<%= libraryName %>/dynamic';
<%= IMPORT %>

let Router = DefaultRouter;
<%= ROUTER_MODIFIER %>

export default function() {
  return (
<%= ROUTER %>
  );
}
