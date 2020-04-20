import ReactDOMServer from 'react-dom/server';
import React, { useEffect } from 'react';
import { ApplyPluginsType, Plugin, StaticRouter } from '@umijs/runtime';
import { matchRoutes } from 'react-router-config';
import { IRoute } from '..';
import renderRoutes from '../renderRoutes/renderRoutes';

interface IOpts {
  pathname: string;
  extraProps: object;
  routes: IRoute[];
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
  const { pathname, context, ...renderRoutesProps } = opts;
  return <StaticRouter location={pathname} context={context}>{renderRoutes(renderRoutesProps)}</StaticRouter>;
}

export default async function renderServer(opts: IOpts) {
  const element = createServerElement(opts);
  // TODO: umi plugin to extend
  const html = ReactDOMServer.renderToString(element);
  return html;
}
