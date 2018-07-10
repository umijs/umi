import React from 'react';
import { matchRoutes } from 'react-router-config';

export default function(props) {
  if (process.env.NODE_ENV !== 'development') {
    const match = matchRoutes(props.route.routes, window.location.pathname);
    if (!match.find(m => m.match.isExact)) {
      window.g_history.replace('/404');
      return '';
    }
  }
  return <div>{props.children}</div>;
}
