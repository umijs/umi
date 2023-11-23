import React from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';
import { fetchServerLoader } from './dataFetcher';
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
  const location = useLocation();
  const { clientRoutes } = useAppData();
  // use `useLocation` get location without `basename`, not need `basename` param
  const routes = matchRoutes(clientRoutes, location.pathname) as
    | ISelectedRoutes[]
    | undefined;
  return routes || [];
}

export function useRouteProps<T extends Record<string, any> = any>() {
  const currentRoute = useSelectedRoutes().slice(-1);
  const { element: _, ...props } = currentRoute[0]?.route || {};
  return props as any as T;
}

type ServerLoaderFunc = (...args: any[]) => Promise<any> | any;
export function useServerLoaderData<T extends ServerLoaderFunc = any>() {
  const routes = useSelectedRoutes();
  const { serverLoaderData, basename } = useAppData();
  const [data, setData] = React.useState(() => {
    const ret = {} as Awaited<ReturnType<T>>;
    let has = false;
    routes.forEach((route) => {
      // 多级路由嵌套时，需要合并多级路由 serverLoader 的数据
      const routeData = serverLoaderData[route.route.id];
      if (routeData) {
        Object.assign(ret, routeData);
        has = true;
      }
    });
    return has ? ret : undefined;
  });
  React.useEffect(() => {
    // @ts-ignore
    if (!window.__UMI_LOADER_DATA__) {
      // 支持 ssr 降级，客户端兜底加载 serverLoader 数据
      Promise.all(
        routes
          .filter((route) => route.route.hasServerLoader)
          .map(
            (route) =>
              new Promise((resolve) => {
                fetchServerLoader({
                  id: route.route.id,
                  basename,
                  cb: resolve,
                });
              }),
          ),
      ).then((datas) => {
        if (datas.length) {
          const res = {} as Awaited<ReturnType<T>>;
          datas.forEach((data) => {
            Object.assign(res, data);
          });
          setData(res);
        }
      });
    }
  }, []);
  return {
    data,
  };
}

export function useClientLoaderData() {
  const route = useRouteData();
  const appData = useAppData();
  return { data: appData.clientLoaderData[route.route.id] };
}
