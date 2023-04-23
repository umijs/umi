import cx from 'classnames';
import React from 'react';
import { useThemeContext } from './context';
import Github from './Github';
import LangSwitch from './LangSwitch';
import Logo from './Logo';
import NavBar from './NavBar';
import Search from './Search';
import ThemeSwitch from './ThemeSwitch';

interface HeadProps {
  isMenuOpened: boolean;
  setMenuOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

export default (props: HeadProps) => {
  const { themeConfig } = useThemeContext()!;
  return (
    <div
      className="w-full flex flex-row items-center justify-between
      border-b-gray-100 border-b-2 pt-4 pb-4 px-4 lg:px-12 dark:border-b-gray-800"
    >
      <div className="flex flex-row items-center">
        <Logo />
        {themeConfig.extraNavLeft && <themeConfig.extraNavLeft />}
      </div>
      <div className="flex flex-row items-center">
        <Search />
        {/* 小屏幕显示打开菜单的按钮 */}
        <div
          className="block lg:hidden ml-2 cursor-pointer"
          onClick={() => props.setMenuOpened((o) => !o)}
        >
          <HamburgerButton {...props} />
        </div>
        {/* 大屏幕显示完整的操作按钮 */}
        <div className="hidden lg:block">
          <NavBar />
        </div>
        <div className="ml-4 hidden lg:block">
          <LangSwitch />
        </div>
        {themeConfig.themeSwitch && (
          <div className="ml-4 hidden lg:block">
            <ThemeSwitch />
          </div>
        )}
        <div className="ml-4 hidden lg:block">
          <Github />
        </div>
        {themeConfig.extraNavRight && <themeConfig.extraNavRight />}
      </div>
    </div>
  );
};

interface HamburgerButtonProps {
  isMenuOpened: boolean;
}

function HamburgerButton(props: HamburgerButtonProps) {
  const { isMenuOpened } = props;
  const barClass =
    'absolute h-0.5 w-5 -translate-x-2.5 bg-current transform dark:bg-white ' +
    'transition duration-500 ease-in-out';

  return (
    <div className="p-4">
      <span
        className={cx(
          barClass,
          isMenuOpened ? 'rotate-45 ' : '-translate-y-1.5',
        )}
      />
      <span className={cx(barClass, isMenuOpened && 'opacity-0')} />
      <span
        className={cx(
          barClass,
          isMenuOpened ? '-rotate-45' : 'translate-y-1.5',
        )}
      />
    </div>
  );
}
