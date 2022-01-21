import React from 'react';
import { useThemeContext } from './context';

export default () => {
  const { themeConfig } = useThemeContext()!;
  return (
    <div className="flex">
      <div className="mr-1">Logo</div>
      <div>{themeConfig.title}</div>
    </div>
  );
};
