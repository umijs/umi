import cx from 'classnames';
import React, { useState } from 'react';
import MoonIcon from './icons/moon.png';
import SunIcon from './icons/sun.png';

export default () => {
  const [toggle, setToggle] = useState(true);

  return (
    <div
      className={cx(
        'md:w-12 md:h-6 w-12 h-4 flex items-center bg-gray-300 rounded-full ',
        'py-1 px-1.5  cursor-pointer',
        toggle ? 'bg-blue-300' : 'bg-gray-700',
      )}
      onClick={() => setToggle(!toggle)}
    >
      <div
        className={cx(
          'md:w-4 md:h-4 h-3 w-3 rounded-full shadow-md ',
          'transition transform',
          toggle && 'translate-x-5',
        )}
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
