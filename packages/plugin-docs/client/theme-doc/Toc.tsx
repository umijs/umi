import React from 'react';
import { useThemeContext } from './context';

export default () => {
  const { location, appData } = useThemeContext();
  const route = appData.routes[location.pathname.slice(1)];
  const titles = route.titles.filter((t: any) => t.level > 1);
  return (
    <div>
      <ul>
        {titles.map((item: any) => {
          return <li>{item.title}</li>;
        })}
      </ul>
    </div>
  );
};
