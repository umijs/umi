import React from 'react';
import Github from './Github';
import LangSwitch from './LangSwitch';
import Logo from './Logo';
import NavBar from './NavBar';
import Search from './Search';
import ThemeSwitch from './ThemeSwitch';

export default () => {
  return (
    <div
      className="w-full flex flex-row items-center justify-between
      border-b-gray-100 border-b-2 pt-4 pb-4 px-8"
    >
      <Logo />
      <div className="flex flex-row items-center">
        <Search />
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
