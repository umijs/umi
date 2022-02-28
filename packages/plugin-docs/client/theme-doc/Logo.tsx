import React from 'react';
import { useThemeContext } from './context';
import useLanguage from './useLanguage';

export default () => {
  const { themeConfig, components } = useThemeContext()!;
  const { isFromPath, currentLanguage } = useLanguage();

  // @ts-ignore
  const { logo } = themeConfig;

  return (
    <components.Link to={isFromPath ? '/' + currentLanguage?.locale : '/'}>
      <div className="flex flex-row items-center">
        <img src={logo} className="w-8 h-8" alt="logo" />
        <div className="text-xl font-extrabold ml-2 dark:text-white">
          {themeConfig.title}
        </div>
      </div>
    </components.Link>
  );
};
