import React, { useState } from 'react';
import MoonIcon from './icons/moon.png';
import SunIcon from './icons/sun.png';

export default () => {
  const [toggle, setToggle] = useState(true);

  const toggleClass = ' transform translate-x-6';

  return (
    <div
      className={
        'md:w-12 md:h-6 w-12 h-4 flex items-center bg-gray-300 ' +
        'rounded-full p-1 cursor-pointer' +
        (toggle ? ' bg-blue-300' : ' bg-gray-700')
      }
      onClick={() => setToggle(!toggle)}
    >
      <div
        className={
          'md:w-4 md:h-4 h-3 w-3 rounded-full shadow-md transition transform' +
          (toggle ? null : toggleClass)
        }
      >
        <img
          src={toggle ? SunIcon : MoonIcon}
          alt="toggle"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
