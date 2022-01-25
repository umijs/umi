import React from 'react';
import { useThemeContext } from './context';
import useLanguage from './useLanguage';

export default () => {
  const { components, themeConfig } = useThemeContext()!;
  const lang = useLanguage();
  return (
    <ul className="flex">
      {themeConfig.navs.map((nav: any) => {
        return (
          <li key={nav.path} className="ml-4 dark:text-white">
            <components.Link
              to={
                lang.isFromPath
                  ? lang.currentLanguage?.locale + nav.path
                  : nav.path
              }
            >
              {lang.render(nav.title)}
            </components.Link>
          </li>
        );
      })}
    </ul>
  );
};
