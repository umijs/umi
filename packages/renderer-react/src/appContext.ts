import React from 'react';

export const AppContext = React.createContext<any>(null);

export function useAppData(): any {
  return React.useContext(AppContext);
}
