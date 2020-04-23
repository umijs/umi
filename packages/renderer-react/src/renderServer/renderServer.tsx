import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { Plugin, StaticRouter, ApplyPluginsType } from '@umijs/runtime';
import { IRoute } from '..';
import renderRoutes from '../renderRoutes/renderRoutes';

interface IOpts {
  path: string;
  extraProps: object;
  basename: string;
  routes: IRoute[];
  pageInitialProps: object;
  appInitialData: object;
  initialData: any;
  context: object;
  stream?: boolean;
  /** unused */
  plugin: Plugin;
}

/**
 * 处理 getInitialProps、路由 StaticRouter、数据预获取
 * @param opts
 */
export function createServerElement(opts: IOpts): React.ReactElement {
  const { path, context, basename = '/', ...renderRoutesProps } = opts;
  return renderRoutesProps.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: (
      // basename maybe react-router bug, will lead to double slash
      <StaticRouter basename={basename === '/' ? '' : basename} location={path} context={context}>{renderRoutes(renderRoutesProps)}</StaticRouter>
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

export default async function renderServer(opts: IOpts) {
  const element = createServerElement(opts);
  if (opts.stream) {
    return ReactDOMServer.renderToNodeStream(element);
  }
  // by default
  const html = ReactDOMServer.renderToString(element);
  return html;
}
