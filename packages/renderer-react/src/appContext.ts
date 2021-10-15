import React from 'react';

export interface IAppContextType {
  routes: any;
  routeComponents: any;
  clientRoutes: any;
}
export const AppContext = React.createContext<IAppContextType | undefined>(
  undefined,
);

export function useAppContext(): IAppContextType {
  return React.useContext(AppContext)!;
}
