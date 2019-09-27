import fs from 'fs';
import chalk from 'chalk';
import { join } from 'path';
import { winPath } from 'umi-utils';
import { getBlockListFromGit } from '../../../util';
import { fetchBlockList } from '../../util';
import { BlockData, Resource } from '../../../data.d';

export interface TreeData {
  title: string;
  value: string;
  key: string;
  children?: TreeData[];
}

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
      // 是文件夹 并且不已 . 开头, 且最深三层
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

/**
 * pro-blocks 获取区块列表
 * https://github.com/ant-design/pro-blocks 是 pro 的官方区块
 */
const fetchProBlockList = async (): Promise<BlockData> => {
  try {
    const blocks = await getBlockListFromGit('https://github.com/ant-design/pro-blocks');
    return {
      data: blocks,
      success: true,
    };
  } catch (error) {
    return {
      message: error.message,
      data: undefined,
      success: false,
    };
  }
};

export const DEFAULT_RESOURCES: Resource[] = [
  {
    id: 'ant-design-pro',
    name: 'Ant Design Pro',
    resourceType: 'custom',
    blockType: 'template',
    getData: () => fetchBlockList('ant-design/pro-blocks'),
  },
  {
    id: 'ant-design-blocks',
    name: 'Ant Design',
    resourceType: 'custom',
    blockType: 'block',
    getData: () => fetchBlockList('ant-design/ant-design-blocks'),
  },
];

// 日志带 block 前缀
export const createBlockLog = log => {
  return (logType: 'error' | 'info', info: string) => {
    return log(logType, `${chalk.hex('#40a9ff')('block:')} ${info}`);
  };
};

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

export const genRouterToTreeData = routes =>
  routes
    .map(item =>
      item.path || item.routes
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
 *  转化一下
 *  /user /user/list /user/list/item
 *  ---->
 *  {
 *    path:"/user",
 *    children:[{ path: "/user/list" }]
 *  }
 * @param routes
 */
export const depthRouterConfig = routes => {
  const routerConfig = reduceData(genRouterToTreeData(routes));
  /**
   * 这里可以拼接可以减少一次循环
   */
  return (
    Object.keys(routerConfig)
      .sort((a, b) => a.split('/').length - b.split('/').length + a.length - b.length)
      .map(key => {
        key
          .split('/')
          .filter(routerKey => routerKey)
          .forEach((_, index, array) => {
            const routerKey = array.slice(0, index + 1).join('/');
            if (routerKey.includes('/')) {
              delete routerConfig[`/${routerKey}`];
            }
          });
        return routerConfig[key];
      })
      // 删除没有 children 的数据
      .filter(item => item)
  );
};

/**
 * 判断路由是否存在
 * @param {*} path string
 * @param {*} routes
 */
export function routeExists(path, routes = []) {
  const routerConfig = reduceData(genRouterToTreeData(routes));
  if (routerConfig[path]) {
    return true;
  }
  return false;
}

/**
 * 从 resource 中获取数据源
 */
export const getBlockList = async (resourceId: string, list: Resource[]) => {
  const resource = list.find(item => item.id === resourceId);
  if (resource) {
    if (resource.resourceType === 'custom') {
      const { data } = await resource.getData();
      return data;
    }
    return [];
  }
  throw new Error(`not find resource ${resourceId}`);
};
