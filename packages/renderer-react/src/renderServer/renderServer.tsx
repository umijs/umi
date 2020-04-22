import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { Plugin, StaticRouter, ApplyPluginsType } from '@umijs/runtime';
import { IRoute } from '..';
import renderRoutes from '../renderRoutes/renderRoutes';

interface IOpts {
  path: string;
  extraProps: object;
  routes: IRoute[];
  pageInitialProps: object;
  appInitialData: object;
  initialData: any;
  context: object;
  /** unused */
  plugin: Plugin;
}

/**
 * 处理 getInitialProps、路由 StaticRouter、数据预获取
 * @param opts
 */
export function createServerElement(opts: IOpts): React.ReactElement {
  const { path, context, ...renderRoutesProps } = opts;
  return renderRoutesProps.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: (
      <StaticRouter location={path} context={context}>{renderRoutes(renderRoutesProps)}</StaticRouter>
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
  const html = ReactDOMServer.renderToString(element);
  return html;
}
