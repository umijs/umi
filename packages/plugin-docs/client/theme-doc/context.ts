import React from 'react';

export const ThemeContext = React.createContext<any>(null);

export function useThemeContext(): any {
  return React.useContext(ThemeContext);
}
