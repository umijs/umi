import React from 'react';
import Index from '../src/index';
import Users from '../src/users';

const findRoute = pathname => {
  const pageMap = {
    '/': Index,
    '/users': Users,
  };
  return pageMap[pathname];
};

const serverRender = ctx => {
  const pathname = ctx.req.url;
  const activeRoute = findRoute(pathname) || false;
  let props = {};
  if (activeRoute && activeRoute.getInitialProps) {
    props = activeRoute.getInitialProps();
  }
  return {
    htmlElement: React.createElement(activeRoute, props),
    rootContainer: React.createElement(activeRoute, props),
  };
};
const ReactDOMServer = require('react-dom/server');
export { ReactDOMServer };

export default serverRender;
