import React from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';
import { useRouteData } from './routeContext';
import {
  IClientRoute,
  ILoaderData,
  IRouteComponents,
  IRoutesById,
  ISelectedRoutes,
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
  history?: any;
}

export const AppContext = React.createContext<IAppContextType>(
  {} as IAppContextType,
);

export function useAppData() {
  return React.useContext(AppContext);
}

export function useSelectedRoutes() {
  const { pathname } = useLocation();
  const { clientRoutes } = useAppData();
  // use `useLocation` get location without `basename`, not need `basename` param
  return React.useMemo(
    () => (matchRoutes(clientRoutes, pathname) || []) as ISelectedRoutes[],
    [clientRoutes, pathname],
  );
}

export function useRouteProps<T extends Record<string, any> = any>() {
  const currentRoute = useSelectedRoutes().slice(-1);
  const { element: _, ...props } = currentRoute[0]?.route || {};
  return props as any as T;
}

type ServerLoaderFunc = (...args: any[]) => Promise<any> | any;

// @deprecated  Please use `useLoaderData` instead.
export function useServerLoaderData<T extends ServerLoaderFunc = any>() {
  const routes = useSelectedRoutes();
  const { serverLoaderData } = useAppData();
  const data = React.useMemo(() => {
    const merged = {} as Awaited<ReturnType<T>>;
    let hasData = false;
    for (const route of routes) {
      // Merge parent and child loader data in route order.
      const routeData = serverLoaderData[route.route.id];
      if (routeData) {
        Object.assign(merged, routeData);
        hasData = true;
      }
    }
    return hasData ? merged : undefined;
  }, [routes, serverLoaderData]);
  return { data };
}

// @deprecated  Please use `useLoaderData` instead.
export function useClientLoaderData() {
  const route = useRouteData();
  const appData = useAppData();
  return { data: appData.clientLoaderData[route.route.id] };
}

export function useLoaderData<T extends ServerLoaderFunc = any>() {
  const serverLoaderData = useServerLoaderData();
  const clientLoaderData = useClientLoaderData();
  return {
    data: {
      ...serverLoaderData.data,
      ...clientLoaderData.data,
    },
  } as Awaited<ReturnType<T>>;
}
