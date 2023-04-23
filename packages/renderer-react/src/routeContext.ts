import React from 'react';
import { IRoute } from './types';

export interface IRouteContextType {
  route: IRoute;
}
export const RouteContext = React.createContext<IRouteContextType | undefined>(
  undefined,
);

export function useRouteData(): IRouteContextType {
  return React.useContext(RouteContext)!;
}
