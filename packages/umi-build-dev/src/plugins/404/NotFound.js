import React from 'react';
import Link from 'umi/link';
import withRouter from 'umi/withRouter';
import guessJSFileFromPath from '../../utils/guessJSFileFromPath';

function renderRoutes(routes) {
  return (
    <ul>
      {routes.map(route => {
        return (
          <li key={route.path}>
            <Link to={route.path}>{route.path}</Link>
            {route.routes ? renderRoutes(route.routes) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default withRouter(({ location, pagesPath, routes }) => {
  const jsFile = guessJSFileFromPath(location.pathname);

  return (
    <div>
      <h1>umi development 404 page</h1>
      <p>
        There's not a page yet at <code>{location.pathname}</code>
      </p>
      <p>
        Create a React.js component in your pages directory at{' '}
        <code>
          {pagesPath}/{jsFile}
        </code>{' '}
        and this page will automatically refresh to show the new page component
        you created.
      </p>
      <h2>Page List</h2>
      {renderRoutes(JSON.parse(routes))}
    </div>
  );
});
