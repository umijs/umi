// @ts-ignore
import App from '@@/core/App.vue';
// @ts-ignore
import { createApp } from 'vue';
// @ts-ignore
import { createRouter, RouterHistory } from 'vue-router';
import { createClientRoutes } from './routes';
import { IRouteComponents, IRoutesById } from './types';

export const AppContextKey = Symbol('AppContextKey');

export function renderClient(opts: {
  rootElement: string;
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  basename?: string;
  history: RouterHistory;
}) {
  const routes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: opts.routeComponents,
  }) as any;

  let rootContainer = App;

  for (const key of [
    // Lowest to the highest priority
    'innerProvider',
    'i18nProvider',
    'accessProvider',
    'dataflowProvider',
    'outerProvider',
    'rootContainer',
  ]) {
    rootContainer = opts.pluginManager.applyPlugins({
      type: 'modify',
      key,
      initialValue: rootContainer,
      args: {},
    });
  }

  // 路由配置
  const routerConfig = opts.pluginManager.applyPlugins({
    key: 'router',
    type: 'modify',
    initialValue: {},
  });

  const router = createRouter({
    ...routerConfig,
    history: opts.history,
    strict: true,
    routes,
  });

  opts.pluginManager.applyPlugins({
    type: 'event',
    key: 'onRouterCreated',
    args: {
      router,
    },
  });

  const app = createApp(rootContainer);

  opts.pluginManager.applyPlugins({
    type: 'event',
    key: 'onAppCreated',
    args: {
      app,
    },
  });

  app.use(router);

  app.mount(opts.rootElement);

  // 注入appData 数据
  app.provide(AppContextKey, {
    routes: opts.routes,
    routeComponents: opts.routeComponents,
    clientRoutes: routes,
    pluginManager: opts.pluginManager,
    rootElement: opts.rootElement,
  });

  opts.pluginManager.applyPlugins({
    type: 'event',
    key: 'onMounted',
    args: {
      app,
      router,
    },
  });

  return {
    app,
    router,
  };
}
