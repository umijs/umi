import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { Stream } from 'stream';
import {
  Plugin,
  StaticRouter,
  ApplyPluginsType,
  MemoryHistory,
} from '@umijs/runtime';
import { IRoute } from '..';
import { loadGetInitialProps, ILoadGetInitialPropsValue } from './utils';
import renderRoutes from '../renderRoutes/renderRoutes';

export interface IOpts {
  path: string;
  history: MemoryHistory;
  basename: string;
  pathname: string;
  plugin: Plugin;
  routes: IRoute[];
  getInitialPropsCtx?: object;
  initialData?: any;
  context?: object;
  mode?: 'stream' | 'string';
  staticMarkup?: boolean;
  /** unused */
  [key: string]: any;
}

/**
 * 处理 getInitialProps、路由 StaticRouter、数据预获取
 * @param opts
 */
function getRootContainer(
  opts: IOpts & ILoadGetInitialPropsValue,
): React.ReactElement {
  const { path, context, basename = '/', ...renderRoutesProps } = opts;
  return renderRoutesProps.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: (
      // basename maybe react-router bug, will lead to double slash
      <StaticRouter
        basename={basename === '/' ? '' : basename}
        location={path}
        context={context}
      >
        {renderRoutes(renderRoutesProps)}
      </StaticRouter>
    ),
    args: {
      // special rootContainer
      // DISCUSS: history
      // history,
      type: 'ssr',
      routes: opts.routes,
      plugin: opts.plugin,
    },
  });
}

interface IRenderServer extends ILoadGetInitialPropsValue {
  pageHTML: string | Stream;
}

export default async function renderServer(
  opts: IOpts,
): Promise<IRenderServer> {
  const App = opts.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: <></>,
    args: {
      // special rootContainer
      // DISCUSS: history
      // history,
      type: 'ssr',
      routes: opts.routes,
      plugin: opts.plugin,
    },
  });
  // get pageInitialProps
  const { pageInitialProps } = await loadGetInitialProps(opts);
  const rootContainer = getRootContainer({
    ...opts,
    pageInitialProps,
  });
  if (opts.mode === 'stream') {
    return {
      pageHTML: ReactDOMServer[
        opts.staticMarkup ? 'renderToStaticNodeStream' : 'renderToNodeStream'
      ](rootContainer),
      pageInitialProps,
    };
  }
  // by default
  return {
    pageHTML: ReactDOMServer[
      opts.staticMarkup ? 'renderToStaticMarkup' : 'renderToString'
    ](rootContainer),
    pageInitialProps,
  };
}
