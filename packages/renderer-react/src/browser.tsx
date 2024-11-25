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
import { Html } from './html';
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
   * react dom 渲染的的目标节点 id
   * @doc 一般不需要改，微前端的时候会变化
   */
  mountElementId?: string;
  /**
   * react dom 渲染的的目标 dom
   * @doc 一般不需要改，微前端的时候会变化
   */
  rootElement?: HTMLElement;

  __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    /**
     * 内部流程, 渲染特殊 app 节点, 不要使用!!!
     */
    pureApp?: boolean;
    /**
     * 内部流程, 渲染特殊 html 节点, 不要使用!!!
     */

    pureHtml?: boolean;
  };
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
   * ssr 是否启用流式渲染, 默认 true, 对 SEO 存在一定的负优化
   */
  useStream?: boolean;

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
    useStream: opts.useStream,
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
          // preload lazy component
          // window.__umi_route_prefetch__ is available when routePrefetch and manifest config is enabled
          if ((window as any).__umi_route_prefetch__) {
            // ref: https://github.com/facebook/react/blob/0940414/packages/react/src/ReactLazy.js#L135
            const lazyCtor = opts.routeComponents[id]?._payload?._result;
            if (typeof lazyCtor == 'function') {
              lazyCtor();
            }
          }

          const clientLoader = opts.routes[id]?.clientLoader;
          const hasClientLoader = !!clientLoader;
          const hasServerLoader = opts.routes[id]?.hasServerLoader;
          // server loader
          // use ?. since routes patched with patchClientRoutes is not exists in opts.routes

          if (
            !isFirst &&
            hasServerLoader &&
            !hasClientLoader &&
            !window.__UMI_LOADER_DATA__
          ) {
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
          const hasClientLoaderDataInRoute = !!clientLoaderData[id];

          // Check if hydration is needed or there's no server loader for the current route
          const shouldHydrateOrNoServerLoader =
            (hasClientLoader && clientLoader.hydrate) || !hasServerLoader;

          // Check if server loader data is missing in the global window object
          const isServerLoaderDataMissing =
            hasServerLoader && !window.__UMI_LOADER_DATA__;

          if (
            hasClientLoader &&
            !hasClientLoaderDataInRoute &&
            (shouldHydrateOrNoServerLoader || isServerLoaderDataMissing)
          ) {
            // ...
            clientLoader({
              serverLoader: () =>
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
                }),
            }).then((data: any) => {
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
    const loaderData = window.__UMI_LOADER_DATA__ || {};
    const metadata = window.__UMI_METADATA_LOADER_DATA__ || {};

    const hydtateHtmloptions = {
      metadata,
      loaderData,
      mountElementId: opts.mountElementId,
    };
    const _isInternal =
      opts.__INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.pureApp ||
      opts.__INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.pureHtml;

    ReactDOM.hydrateRoot(
      _isInternal ? rootElement : document,
      _isInternal ? (
        <Browser />
      ) : (
        <Html {...hydtateHtmloptions}>
          <Browser />
        </Html>
      ),
    );
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
