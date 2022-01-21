import React, { useState } from 'react';

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
          'bg-white md:w-4 md:h-4 h-3 w-3 rounded-full shadow-md transition ' +
          'transform' +
          (toggle ? null : toggleClass)
        }
      ></div>
    </div>
  );
};
