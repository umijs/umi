import React from 'react';
import { useRouteData } from './routeContext';
import {
  IClientRoute,
  ILoaderData,
  IRouteComponents,
  IRoutesById,
} from './types';
import { useLocation, matchRoutes } from 'react-router-dom';

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
  history?: any;
}

export const AppContext = React.createContext<IAppContextType>(
  {} as IAppContextType,
);

export function useAppData() {
  return React.useContext(AppContext);
}

export function useSelectedRoutes() {
  const location = useLocation();
  const { clientRoutes } = useAppData();
  // use `useLocation` get location without `basename`, not need `basename` param
  const routes = matchRoutes(clientRoutes, location.pathname);
  return routes || [];
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
