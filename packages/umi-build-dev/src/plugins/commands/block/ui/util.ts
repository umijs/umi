import { IConfig } from 'umi-types';
import fs from 'fs';
import { join } from 'path';
import { winPath } from 'umi-utils';

export interface TreeData {
  title: string;
  value: string;
  key: string;
  children?: TreeData[];
}

export const genRouterToTreeData = (routes: IConfig['routes']) =>
  routes
    .map(item =>
      item.path
        ? {
            title: item.path,
            value: item.path,
            key: item.path,
            children: genRouterToTreeData(item.routes || []),
          }
        : undefined,
    )
    .filter(item => item);

/**
 * 打平 children
 * {
 *    path:"/user",
 *    children:[{ path: "/user/list" }]
 *  }
 *  --->
 *  /user /user/list
 * @param treeData
 */
const reduceData = treeData =>
  treeData.reduce((pre, current) => {
    const router = pre[current.key];
    let childrenKeys = {};
    if (current && current.children) {
      childrenKeys = reduceData(current.children);
    }

    if (!router) {
      pre[current.key] = current;
    }

    return {
      ...pre,
      ...childrenKeys,
    };
  }, {});

/**
 *  转化一下
 *  /user /user/list /user/list/item
 *  ---->
 *  {
 *    path:"/user",
 *    children:[{ path: "/user/list" }]
 *  }
 * @param routes
 */
export const depthRouterConfig = (routes: IConfig['routes']) => {
  const routerConfig = reduceData(genRouterToTreeData(routes));
  /**
   * 这里可以拼接可以减少一次循环
   */
  return (
    Object.keys(routerConfig)
      .map(key => {
        key
          .split('/')
          .filter(routerKey => routerKey)
          .forEach((_, index, array) => {
            const routerKey = array.slice(0, index).join('/');
            if (routerKey) {
              routerConfig[`/${routerKey}`] = routerConfig[key];
            }
          });
        return routerConfig[key];
      })
      // 删除没有 children 的数据
      .filter(item => item && item.children && item.children.length)
  );
};

/**
 * 遍历文件地址
 * @param path
 */
export const getFolderTreeData = (
  path: string,
  parentPath: string = '/',
  depth: number = 0,
): TreeData[] => {
  const files = fs.readdirSync(winPath(path));
  return files
    .map((fileName: string) => {
      const status = fs.statSync(join(path, fileName));
      // 是文件夹 并且不已 . 开头且最深三层
      if (status.isDirectory() && fileName.indexOf('.') !== 0 && depth < 3) {
        const absPath = winPath(join(path, fileName));
        const absPagePath = winPath(join(parentPath, fileName));
        const children = getFolderTreeData(absPath, absPagePath, depth + 1);
        if (children && children.length > 0) {
          return {
            key: absPagePath,
            title: fileName,
            value: absPagePath,
            children,
          };
        }
        return { title: fileName, value: absPagePath, key: absPagePath };
      }
      return undefined;
    })
    .filter(obj => obj);
};

export function routeExists(path, routes) {
  const routerConfig = reduceData(genRouterToTreeData(routes));
  if (routerConfig[path]) {
    return true;
  }
  return false;
}
