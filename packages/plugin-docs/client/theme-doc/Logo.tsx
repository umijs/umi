import React from 'react';
import { useThemeContext } from './context';
import useLanguage from './useLanguage';

export default () => {
  const { themeConfig, components } = useThemeContext()!;
  const { isFromPath, currentLanguage } = useLanguage();
  const Logo = themeConfig.logo;

  return (
    <components.Link to={isFromPath ? '/' + currentLanguage?.locale : '/'}>
      <div className="flex flex-row items-center">
        {typeof Logo === 'string' && (
          <img src={Logo} className="w-8 h-8" alt="logo" />
        )}
        {typeof Logo === 'function' && <Logo />}
        <div
          id="header-title"
          className="text-xl font-extrabold ml-2 dark:text-white"
        >
          {themeConfig.title}
        </div>
      </div>
    </components.Link>
  );
};
