import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { Plugin, StaticRouter } from '@umijs/runtime';
import { IRoute } from '..';
import renderRoutes from '../renderRoutes/renderRoutes';

interface IOpts {
  path: string;
  extraProps: object;
  routes: IRoute[];
  pageInitialProps: object;
  initialData: any;
  context: object;
  /** unused */
  plugin: Plugin;
}

/**
 * 处理 getInitialProps、路由 StaticRouter、数据预获取
 * @param opts
 */
export const createServerElement = (opts: IOpts): React.ReactElement => {
  const { path, context, ...renderRoutesProps } = opts;
  return <StaticRouter location={path} context={context}>{renderRoutes(renderRoutesProps)}</StaticRouter>;
}

export default async function renderServer(opts: IOpts) {
  const element = createServerElement(opts);
  // TODO: umi plugin to extend
  const html = ReactDOMServer.renderToString(element);
  return html;
}
