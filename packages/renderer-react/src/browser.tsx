import { History } from 'history';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
// compatible with < react@18 in @umijs/preset-umi/src/features/react
import ReactDOM from 'react-dom/client';
import { matchRoutes, Router, useRoutes } from 'react-router-dom';
import { AppContext, useAppData } from './appContext';
import { fetchServerLoader } from './dataFetcher';
import { createClientRoutes } from './routes';
import { ILoaderData, IRouteComponents, IRoutesById } from './types';

let root: ReactDOM.Root | null = null;

// react 18 some scenarios need unmount such as micro app
export function __getRoot() {
  return root;
}

/**
 * 这个组件的功能是 history 发生改变的时候重新触发渲染
 * @param props
 * @returns
 */
function BrowserRoutes(props: {
  routes: any;
  clientRoutes: any;
  pluginManager: any;
  history: History;
  basename: string;
  children: any;
}) {
  const { history } = props;
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });
  useLayoutEffect(() => history.listen(setState), [history]);
  useLayoutEffect(() => {
    function onRouteChange(opts: any) {
      props.pluginManager.applyPlugins({
        key: 'onRouteChange',
        type: 'event',
        args: {
          routes: props.routes,
          clientRoutes: props.clientRoutes,
          location: opts.location,
          action: opts.action,
          basename: props.basename,
          isFirst: Boolean(opts.isFirst),
        },
      });
    }
    onRouteChange({
      location: state.location,
      action: state.action,
      isFirst: true,
    });
    return history.listen(onRouteChange);
  }, [history, props.routes, props.clientRoutes]);
  return (
    <Router
      navigator={history}
      location={state.location}
      basename={props.basename}
    >
      {props.children}
    </Router>
  );
}

export function Routes() {
  const { clientRoutes } = useAppData();
  return useRoutes(clientRoutes);
}

/**
 * umi 渲染需要的配置，在node端调用的哦
 */
export type RenderClientOpts = {
  /**
   * 配置 webpack 的 publicPath。
   * @doc https://umijs.org/docs/api/config#publicpath
   */
  publicPath?: string;
  /**
   * 是否是 runtimePublicPath
   * @doc https://umijs.org/docs/api/config#runtimepublicpath
   */
  runtimePublicPath?: boolean;
  /**
   * react dom 渲染的的目标 dom
   * @doc 一般不需要改，微前端的时候会变化
   */
  rootElement?: HTMLElement;
  /**
   * 当前的路由配置
   */
  routes: IRoutesById;
  /**
   * 当前的路由对应的dom组件
   */
  routeComponents: IRouteComponents;
  /**
   * 插件的执行实例
   */
  pluginManager: any;
  /**
   * 设置路由 base，部署项目到非根目录下时使用。
   * @doc https://umijs.org/docs/api/config#base
   */
  basename?: string;
  /**
   * loading 中展示的组件 dom
   */
  loadingComponent?: React.ReactNode;
  /**
   * react router 的 history，用于控制列表渲染
   * @doc https://umijs.org/docs/api/config#history
   * 有多种不同的类型，测试的时候建议用 内存路由，默认是 browserHistory
   */
  history: History;
  /**
   * ssr 的配置
   */
  hydrate?: boolean;

  /**
   * 直接返回组件，是为了方便测试
   */
  components?: boolean;
  /**
   * 启用 react-router 5 兼容模式。
   * 此模式下，路由组件的 props 会包含 location、match、history 和 params 属性，和 react-router 5 的保持一致。
   */
  reactRouter5Compat?: boolean;
  /**
   * 应用渲染完成的回调函数
   */
  callback?: () => void;
};
/**
 * umi max 所需要的所有插件列表，用于获取provide
 */
const UMI_CLIENT_RENDER_REACT_PLUGIN_LIST = [
  // Lowest to the highest priority
  'innerProvider',
  'i18nProvider',
  'accessProvider',
  'dataflowProvider',
  'outerProvider',
  'rootContainer',
];

/**
 *
 * @param {RenderClientOpts} opts - 插件相关的配置
 * @param {React.ReactElement} routesElement 需要渲染的 routers，为了方便测试注入才导出
 * @returns @returns A function that returns a React component.
 */
const getBrowser = (
  opts: RenderClientOpts,
  routesElement: React.ReactElement,
) => {
  const basename = opts.basename || '/';
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: opts.routeComponents,
    loadingComponent: opts.loadingComponent,
    reactRouter5Compat: opts.reactRouter5Compat,
  });
  opts.pluginManager.applyPlugins({
    key: 'patchClientRoutes',
    type: 'event',
    args: {
      routes: clientRoutes,
    },
  });

  let rootContainer = (
    <BrowserRoutes
      basename={basename}
      pluginManager={opts.pluginManager}
      routes={opts.routes}
      clientRoutes={clientRoutes}
      history={opts.history}
    >
      {routesElement}
    </BrowserRoutes>
  );

  // 加载所有需要的插件
  for (const key of UMI_CLIENT_RENDER_REACT_PLUGIN_LIST) {
    rootContainer = opts.pluginManager.applyPlugins({
      type: 'modify',
      key: key,
      initialValue: rootContainer,
      args: {
        routes: opts.routes,
        history: opts.history,
        plugin: opts.pluginManager,
      },
    });
  }

  /**
   * umi 增加完 Provide 的 react dom，可以直接交给 react-dom 渲染
   * @returns {React.ReactElement}
   */
  const Browser = () => {
    const [clientLoaderData, setClientLoaderData] = useState<ILoaderData>({});
    const [serverLoaderData, setServerLoaderData] = useState<ILoaderData>(
      // @ts-ignore
      window.__UMI_LOADER_DATA__ || {},
    );

    const handleRouteChange = useCallback(
      (id: string, isFirst?: boolean) => {
        // Patched routes has to id
        const matchedRouteIds = (
          matchRoutes(clientRoutes, id, basename)?.map(
            // @ts-ignore
            (route) => route.route.id,
          ) || []
        ).filter(Boolean);
        matchedRouteIds.forEach((id) => {
          // preload
          // @ts-ignore
          const manifest = window.__umi_manifest__;
          if (manifest) {
            const routeIdReplaced = id.replace(/[\/\-]/g, '_');
            const preloadId = `preload-${routeIdReplaced}.js`;
            if (!document.getElementById(preloadId)) {
              const keys = Object.keys(manifest).filter((k) =>
                k.startsWith(routeIdReplaced + '.'),
              );
              keys.forEach((key) => {
                if (!/\.(js|css)$/.test(key)) {
                  throw Error(`preload not support ${key} file`);
                }
                let file = manifest[key];
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'style';
                if (key.endsWith('.js')) {
                  link.as = 'script';
                  link.id = preloadId;
                }
                // publicPath already in the manifest,
                // but if runtimePublicPath is true, we need to replace it
                if (opts.runtimePublicPath) {
                  file = file.replace(
                    new RegExp(`^${opts.publicPath}`),
                    // @ts-ignore
                    window.publicPath,
                  );
                }
                link.href = file;
                document.head.appendChild(link);
              });
            }
          }
          // server loader
          // use ?. since routes patched with patchClientRoutes is not exists in opts.routes
          if (!isFirst && opts.routes[id]?.hasServerLoader) {
            fetchServerLoader({
              id,
              basename,
              cb: (data) => {
                // setServerLoaderData when startTransition because if ssr is enabled,
                // the component may being hydrated and setLoaderData will break the hydration
                React.startTransition(() => {
                  setServerLoaderData((d) => ({ ...d, [id]: data }));
                });
              },
            });
          }
          // client loader
          // onPatchClientRoutes 添加的 route 在 opts.routes 里是不存在的
          const clientLoader = opts.routes[id]?.clientLoader;
          if (clientLoader && !clientLoaderData[id]) {
            clientLoader().then((data: any) => {
              setClientLoaderData((d: any) => ({ ...d, [id]: data }));
            });
          }
        });
      },
      [clientLoaderData],
    );

    useEffect(() => {
      handleRouteChange(window.location.pathname, true);
      return opts.history.listen((e) => {
        handleRouteChange(e.location.pathname);
      });
    }, []);

    useLayoutEffect(() => {
      if (typeof opts.callback === 'function') opts.callback();
    }, []);

    return (
      <AppContext.Provider
        value={{
          routes: opts.routes,
          routeComponents: opts.routeComponents,
          clientRoutes,
          pluginManager: opts.pluginManager,
          rootElement: opts.rootElement!,
          basename,
          clientLoaderData,
          serverLoaderData,
          preloadRoute: handleRouteChange,
          history: opts.history,
        }}
      >
        {rootContainer}
      </AppContext.Provider>
    );
  };
  return Browser;
};

/**
 *  执行 react dom 的 render 方法
 * @param {RenderClientOpts} opts - 插件相关的配置
 * @returns void
 */
export function renderClient(opts: RenderClientOpts) {
  const rootElement = opts.rootElement || document.getElementById('root')!;
  const Browser = getBrowser(opts, <Routes />);
  // 为了测试，直接返回组件
  if (opts.components) return Browser;

  if (opts.hydrate) {
    ReactDOM.hydrateRoot(rootElement, <Browser />);
    return;
  }

  if (ReactDOM.createRoot) {
    root = ReactDOM.createRoot(rootElement);
    root.render(<Browser />);
    return;
  }
  // @ts-ignore
  ReactDOM.render(<Browser />, rootElement);
}
