{{{ importsAhead }}}
import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/_renderRoutes';
{{{ imports }}}

let Router = {{{ RouterRootComponent }}};

let routes = {{{ routes }}};

export default function() {
  return (
{{{ routerContent }}}
  );
}
