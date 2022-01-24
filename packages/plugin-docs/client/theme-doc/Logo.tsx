import React from 'react';
import { useThemeContext } from './context';

export default () => {
  const { themeConfig } = useThemeContext()!;
  // @ts-ignore
  const { logo } = themeConfig;
  return (
    <a href="/">
      <div className="flex flex-row items-center">
        <img src={logo} className="w-8 h-8" alt="logo" />
        <div className="text-xl font-extrabold ml-2 dark:text-white">
          {themeConfig.title}
        </div>
      </div>
    </a>
  );
};
