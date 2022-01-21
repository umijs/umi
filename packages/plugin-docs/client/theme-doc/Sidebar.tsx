import React from 'react';
import { useThemeContext } from './context';

export default () => {
  const { appData, components, themeConfig } = useThemeContext();
  console.log(appData, themeConfig);

  let routes = Object.keys(appData.routes).map((id) => {
    return appData.routes[id];
  });
  routes = routes.filter((route: any) => {
    return route.path.startsWith('docs/');
  });
  routes = routes.map((route: any) => {
    return {
      ...route,
      component: appData.routeComponents[route.id],
    };
  });

  return (
    <div>
      <ul>
        {routes.map((route) => {
          return (
            <li key={route.id}>
              <components.Link to={route.path}>{route.title}</components.Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
