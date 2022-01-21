import React from 'react';
import Github from './Github';
import LangSwitch from './LangSwitch';
import Logo from './Logo';
import NavBar from './NavBar';
import Search from './Search';
import ThemeSwitch from './ThemeSwitch';

export default () => {
  return (
    <div className="w-full flex border-b-gray-100 border-b-2 pt-4 pb-4">
      <div className="flex-1">
        <Logo />
      </div>
      <div>
        <Search />
      </div>
      <NavBar />
      <div className="ml-4">
        <LangSwitch />
      </div>
      <div className="ml-4">
        <ThemeSwitch />
      </div>
      <div className="ml-4">
        <Github />
      </div>
    </div>
  );
};
