import cx from 'classnames';
import React from 'react';
import { useThemeContext } from './context';
import useLanguage from './useLanguage';

interface SidebarProps {
  setMenuOpened?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default (props: SidebarProps) => {
  const { currentLanguage, isFromPath } = useLanguage();
  const { appData, components, themeConfig, location } = useThemeContext()!;
  const matchedNav = themeConfig.navs.filter((nav) =>
    location.pathname.startsWith(
      (isFromPath && currentLanguage ? '/' + currentLanguage.locale : '') +
        nav.path,
    ),
  )[0];

  if (!matchedNav) {
    return null;
  }

  let locale = currentLanguage?.locale;
  if (!isFromPath) locale = '';

  return (
    <ul
      className={cx(
        'h-screen lg:h-[calc(100vh-8rem)] overflow-y-scroll',
        'lg:w-64 px-8 pt-12 lg:pt-8 pb-36 fadeout w-full',
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
                const to =
                  (locale ? `/${locale}` : '') + `${matchedNav.path}/${child}`;
                const id = `${matchedNav.path}/${child}`.slice(1);
                const route =
                  appData.routes[id + '.' + locale] || appData.routes[id];
                const title = route.titles[0]?.title || null;

                if (to === window.location.pathname) {
                  return (
                    <div
                      id="active-nav-item"
                      key={route.path}
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
                    key={route.path}
                    to={to.startsWith('/') ? to : `/${to}`}
                    prefetch
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
