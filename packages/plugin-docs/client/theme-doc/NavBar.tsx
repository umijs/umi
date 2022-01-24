import React from 'react';
import { useThemeContext } from './context';

export default () => {
  const { components, themeConfig } = useThemeContext()!;
  return (
    <ul className="flex">
      {themeConfig.navs.map((nav: any) => {
        return (
          <li key={nav.path} className="ml-4 dark:text-white">
            <components.Link to={nav.path}>{nav.title}</components.Link>
          </li>
        );
      })}
    </ul>
  );
};
