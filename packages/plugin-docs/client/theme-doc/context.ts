import React from 'react';

interface IContext {
  appData: any;
  components: any;
  themeConfig: {
    title: string;
    github: string;
    logo: string;
    navs: {
      path: string;
      title: string;
      children: any[];
    }[];
  };
  location: {
    pathname: string;
    search: string;
    hash: string;
    key: string;
  };
}

export const ThemeContext = React.createContext<IContext | null>(null);

export function useThemeContext(): IContext | null {
  return React.useContext(ThemeContext);
}
