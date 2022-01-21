import React from 'react';
import { useThemeContext } from './context';

export default () => {
  const { location, appData } = useThemeContext()!;
  const route = appData.routes[location.pathname.slice(1)];

  if (!route) {
    return null;
  }

  const titles = route.titles.filter((t: any) => t.level > 1);
  return (
    <div
      className="w-full lg:m-12 mb-12 border
      border-gray-100 p-8 rounded-xl z-20"
    >
      <p className="text-lg font-extrabold">{route.titles[0].title}</p>
      <ul>
        {titles.map((item: any) => {
          return (
            <li
              className="mt-3 text-gray-600 cursor-pointer
              hover:text-blue-500 transition duration-300"
            >
              <a href={'#' + item.title}>{item.title}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
