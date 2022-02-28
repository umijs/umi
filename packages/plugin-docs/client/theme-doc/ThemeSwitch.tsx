import cx from 'classnames';
import React, { useEffect, useState } from 'react';
import MoonIcon from './icons/moon.png';
import SunIcon from './icons/sun.png';

export default () => {
  const [toggle, setToggle] = useState<Boolean>();

  useEffect(() => {
    // 初始化，获取过去曾经设定过的主题，或是系统当前的主题
    if (toggle === undefined) {
      if (localStorage.getItem('theme') === 'dark') {
        setToggle(false);
        return;
      }
      if (localStorage.getItem('theme') === 'light') {
        setToggle(true);
        return;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setToggle(false);
        return;
      }
      setToggle(true);
    }

    if (toggle) {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, [toggle]);

  return (
    <div
      className={cx(
        'md:w-12 md:h-6 w-12 h-4 flex items-center rounded-full ',
        'py-1 px-1.5  cursor-pointer',
        toggle ? 'bg-gray-100' : 'bg-gray-700',
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
