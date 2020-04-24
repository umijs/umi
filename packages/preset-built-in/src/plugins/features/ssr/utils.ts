import * as fs from 'fs';
import * as path from 'path';
import { IRoute, utils } from 'umi';

import { OUTPUT_SERVER_FILENAME } from './constants';

const { lodash } = utils;

export const fixHtmlSuffix = (route: IRoute) => {
  const isHtmlPath = (path: string): boolean => /\.(html|htm)/g.test(path);
  if (route.path && route.path !== '/' && !isHtmlPath(route.path) && !route.redirect) {
    return `${route.path}(.html)?`;
  }
  return route.path;
};

export const getDistContent = (absOutputPath: string): { serverFile: string, htmlFile: string, htmlPath: string, serverFilePath: string } => {
  const serverFilePath = path.join(absOutputPath || '', OUTPUT_SERVER_FILENAME);
  const htmlPath = path.join(absOutputPath || '', 'index.html');

  const serverFile = fs.readFileSync(serverFilePath, 'utf-8');
  const htmlFile = fs.readFileSync(htmlPath, 'utf-8');
  return {
    serverFilePath,
    serverFile,
    htmlPath,
    htmlFile,
  }
}

export const isDynamicRoute = (path: string): boolean =>
  !!path?.split('/')?.some?.(snippet => snippet.startsWith(':'));

const removeSuffixHtml = (path: string): string =>
  path
    .replace('?', '')
    .replace('(', '')
    .replace(')', '')
    .replace(/\.(html|htm)/g, '');

export const getStaticRoutePaths = (routes: IRoute[]) =>
  lodash.uniq(
    routes.reduce((memo: string[], route: IRoute) => {
      if (route.path && !route.redirect) {
        memo.push(removeSuffixHtml(route.path));
        if (route.routes) {
          memo = memo.concat(getStaticRoutePaths(route.routes));
        }
      }
      return memo;
    }, []),
  );

/**
 * convert route path into file path
 * / => index.html
 * /a/b => a/b.html
 * /a/:id => a/[id].html
 * /a/b/:id/:id => a/b/[id]/[id].html
 *
 * @param path
 */
export const routeToFile = (path: string): string => {
  const pathArr = path?.split('/')?.map?.(p => {
    const normalPath = removeSuffixHtml(p);
    return isDynamicRoute(normalPath) ? `[${normalPath.replace(/:/g, '')}]` : normalPath;
  });
  // for basement render, join ${host}/${renderRoutes}
  const pathname = path.startsWith('/') ? pathArr.slice(1).join('/') : pathArr.join('/');
  return pathname ? `${pathname}.html` : 'index.html';
};
