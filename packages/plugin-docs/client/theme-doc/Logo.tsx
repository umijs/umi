import React from 'react';
import { useThemeContext } from './context';

export default () => {
  const { themeConfig, components } = useThemeContext()!;
  // @ts-ignore
  const { logo } = themeConfig;
  return (
    <components.Link to="/">
      <div className="flex flex-row items-center">
        <img src={logo} className="w-8 h-8" alt="logo" />
        <div className="text-xl font-extrabold ml-2 dark:text-white">
          {themeConfig.title}
        </div>
      </div>
    </components.Link>
  );
};
