import cx from 'classnames';
import React from 'react';
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
  return (
    <div
      className="w-full flex flex-row items-center justify-between
      border-b-gray-100 border-b-2 pt-4 pb-4 px-8 dark:border-b-gray-800"
    >
      <Logo />
      <div className="flex flex-row items-center">
        <Search />
        <HamburgerButton {...props} />
        <div className="hidden lg:block">
          <NavBar />
        </div>
        <div className="ml-4 hidden lg:block">
          <LangSwitch />
        </div>
        <div className="ml-4 hidden lg:block">
          <ThemeSwitch />
        </div>
        <div className="ml-4 hidden lg:block">
          <Github />
        </div>
      </div>
    </div>
  );
};

interface HamburgerButtonProps {
  isMenuOpened: boolean;
  setMenuOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

function HamburgerButton(props: HamburgerButtonProps) {
  const barClass =
    'block absolute h-0.5 w-5 bg-current transform dark:bg-white' +
    ' transition duration-500 ease-in-out';

  return (
    <div
      className="relative py-3 sm:max-w-xl mx-auto mx-5 lg:hidden"
      onClick={() => props.setMenuOpened((o) => !o)}
    >
      <span
        className={cx(
          barClass,
          props.isMenuOpened ? 'rotate-45 ' : '-translate-y-1.5',
        )}
      />
      <span className={cx(barClass, props.isMenuOpened && 'opacity-0')} />
      <span
        className={cx(
          barClass,
          props.isMenuOpened ? '-rotate-45' : 'translate-y-1.5',
        )}
      />
    </div>
  );
}
