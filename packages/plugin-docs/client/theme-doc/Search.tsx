import React, { useEffect } from 'react';

export default () => {
  useEffect(() => {
    document.addEventListener('keydown', function (event) {
      if (event.key === '/') {
        event.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    });
  }, []);

  return (
    <div
      className="rounded-lg w-64 flex items-center pr-2 flex-row hover:bg-gray-50
     transition duration-300 bg-gray-100 border border-white focus-within:border-gray-100
     focus-within:bg-white"
    >
      <input
        id="search-input"
        className="w-full bg-transparent outline-0 text-sm px-4 py-2 "
        placeholder="Search anything ..."
      />
      <div
        className="bg-gray-200 rounded w-6 h-6 flex flex-row text-gray-400
       items-center justify-center border border-gray-300"
      >
        /
      </div>
    </div>
  );
};
