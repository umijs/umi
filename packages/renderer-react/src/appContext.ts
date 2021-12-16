import React from 'react';

export const AppContext = React.createContext<any>(null);

export function useAppContext(): any {
  return React.useContext(AppContext);
}
