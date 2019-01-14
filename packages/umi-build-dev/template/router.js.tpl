{{{ importsAhead }}}
import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/_renderRoutes';
{{{ imports }}}

let Router = {{{ RouterRootComponent }}};

let routes = {{{ routes }}};
window.g_routes = routes;
window.g_plugins.applyForEach('patchRoutes', { initialValue: routes });

export default function RouterWrapper() {
  return (
{{{ routerContent }}}
  );
}
