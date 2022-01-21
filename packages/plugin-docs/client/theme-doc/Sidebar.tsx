import React from 'react';
import { useThemeContext } from './context';

export default () => {
  const { appData, components, themeConfig, location } = useThemeContext()!;
  const matchedNav = themeConfig.navs.filter((nav) =>
    location.pathname.startsWith(nav.path),
  )[0];

  if (!matchedNav) {
    return null;
  }

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
        {(matchedNav.children || []).map((item) => {
          return (
            <li key={item.title}>
              <div>
                <h3>{item.title}</h3>
                <div className="pl-4">
                  {item.children.map((child: any) => {
                    const to = `${matchedNav.path}/${child}`;
                    const id = to.slice(1);
                    const { title } = appData.routes[id];
                    return (
                      <div key={child}>
                        <components.Link to={`${matchedNav.path}/${child}`}>
                          {title}
                        </components.Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
