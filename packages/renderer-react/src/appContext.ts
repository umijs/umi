import React from 'react';
import { useRouteData } from './routeContext';
import {
  IClientRoute,
  ILoaderData,
  IRouteComponents,
  IRoutesById,
} from './types';

interface IAppContextType {
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  clientRoutes: IClientRoute[];
  pluginManager: any;
  rootElement?: HTMLElement;
  basename?: string;
  clientLoaderData: ILoaderData;
  preloadRoute?: (to: string) => void;
  serverLoaderData: ILoaderData;
}

export const AppContext = React.createContext<IAppContextType>(
  {} as IAppContextType,
);

export function useAppData() {
  return React.useContext(AppContext);
}

export function useServerLoaderData() {
  const route = useRouteData();
  const appData = useAppData();
  return { data: appData.serverLoaderData[route.route.id] };
}

export function useClientLoaderData() {
  const route = useRouteData();
  const appData = useAppData();
  return { data: appData.clientLoaderData[route.route.id] };
}
