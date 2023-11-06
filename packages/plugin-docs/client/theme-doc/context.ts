import React from 'react';

export interface INavBaseProps {
  path: string;
  title: string;
  type?: 'nav' | 'link';
}

export interface INavDropdown extends INavBaseProps {}

export interface INav extends INavBaseProps {
  /**
   * 不使用 navigate 重定向，而是直接用 link 指定最终地址，否则会破坏 history 历史，导致无法返回
   * https://github.com/umijs/umi/issues/10325
   */
  link: string;
  dropdown?: INavDropdown[];
  children: any[];
}

export interface IThemeConfig {
  title: string;
  description?: string;
  github: string;
  // 键盘搜索的快捷键，参考 https://github.com/madrobby/keymaster
  searchHotKey?: string | { macos: string; windows: string };
  logo: string | React.ComponentType;
  // 在设置文件中声明该项目的国际化功能支持的语言
  i18n?: { locale: string; text: string }[];
  // 插件会从 docs/locales 内将所有 json 文件注入到 themeConfig 中
  // 供 useLanguage 使用
  locales: { [locale: string]: { [key: string]: string } };
  // 顶部导航栏右侧自定义组件
  extraNavRight?: React.ComponentType;
  // 底部导航栏左侧自定义组件
  extraNavLeft?: React.ComponentType;
  navs: INav[];
  announcement?: {
    title: string;
    link?: string;
  };
  themeSwitch?: {};
}

export interface IContext {
  appData: any;
  components: any;
  themeConfig: IThemeConfig;
  location: {
    pathname: string;
    search: string;
    hash: string;
    key: string;
  };
  history: {
    push(to: string, state?: any): void;
  };
}

export const ThemeContext = React.createContext<IContext | null>(null);

export function useThemeContext(): IContext | null {
  return React.useContext(ThemeContext);
}
