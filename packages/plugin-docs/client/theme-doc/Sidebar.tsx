import cx from 'classnames';
import React from 'react';
import { useThemeContext } from './context';

interface SidebarProps {
  setMenuOpened?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default (props: SidebarProps) => {
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
    <ul
      className={cx(
        'h-screen lg:h-[calc(100vh-8rem)] overflow-y-scroll',
        'lg:w-64 p-8 pb-12 fadeout w-full',
      )}
    >
      {(matchedNav.children || []).map((item) => {
        return (
          <li key={item.title}>
            <div>
              <p className="text-xl font-extrabold my-6 dark:text-white">
                {item.title}
              </p>
              {item.children.map((child: any) => {
                const to = `${matchedNav.path}/${child}`;
                const id = to.slice(1);
                const title = appData.routes[id].titles?.[0]?.title || null;

                if (to === window.location.pathname) {
                  return (
                    <div
                      key={child}
                      className="my-2 hover:text-blue-400 transition-all
                       bg-blue-50 text-blue-400 px-4 py-1
                       rounded-lg cursor-default dark:bg-blue-900 dark:text-blue-200"
                    >
                      {title}
                    </div>
                  );
                }

                return (
                  <components.Link
                    to={`${matchedNav.path}/${child}`}
                    onClick={() =>
                      props.setMenuOpened && props.setMenuOpened((o) => !o)
                    }
                  >
                    <div
                      key={child}
                      className="text-gray-700 my-2 hover:text-blue-400 transition-all px-4 py-1 dark:text-blue-200 dark:hover:text-blue-400"
                    >
                      {title}
                    </div>
                  </components.Link>
                );
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
