import React from 'react';
import Logo from './Logo';
import NavBar from './NavBar';
import Search from './Search';

export default () => {
  return (
    <div className="w-full flex border-b-gray-100 border-b-2 pt-4 pb-4">
      <div className="flex-1">
        <Logo />
      </div>
      <div className="mr-4">
        <Search />
      </div>
      <NavBar />
    </div>
  );
};
