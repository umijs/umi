import fs from 'fs';
import chalk from 'chalk';
import { join } from 'path';
import { winPath } from 'umi-utils';
import { fetchBlockList, fetchUmiBlock } from '../../../util';
import { Resource } from '../../../data.d';

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
 * 遍历文件地址
 * 包含文件
 * @param path
 */
export const getFilesTreeData = (
  path: string,
  parentPath: string = '/',
  depth: number = 0,
): TreeData[] => {
  const files = fs.readdirSync(winPath(path));
  return files
    .map((fileName: string) => {
      const status = fs.statSync(join(path, fileName));
      const isDirectory = status.isDirectory();
      // 是文件夹 并且不已 . 开头, 且最深五层
      if (fileName.indexOf('.') !== 0 && depth < 5) {
        if (
          !isDirectory &&
          !fileName.includes('.tsx') &&
          !fileName.includes('.jsx') &&
          !fileName.includes('.js') &&
          !fileName.includes('.ts')
        ) {
          return undefined;
        }
        const absPath = winPath(join(path, fileName));
        const absPagePath = winPath(join(parentPath, fileName));
        const children = isDirectory ? getFilesTreeData(absPath, absPagePath, depth + 1) : [];
        return {
          selectable: !isDirectory,
          key: absPagePath,
          title: fileName,
          value: absPagePath,
          children,
        };
      }
      return undefined;
    })
    .filter(obj => obj);
};

export const DEFAULT_RESOURCES: Resource[] = [
  {
    id: 'ant-design-pro',
    name: 'Ant Design Pro',
    resourceType: 'custom',
    description: '基于 antd 的中台模板。',
    blockType: 'template',
    icon: 'https://img.alicdn.com/tfs/TB1e8gomAL0gK0jSZFAXXcA9pXa-64-64.png',
    getData: () => fetchBlockList('ant-design/pro-blocks'),
  },
  {
    id: 'ant-design-blocks',
    name: 'Ant Design',
    resourceType: 'custom',
    description: '来自 antd 的 Demo 区块',
    blockType: 'block',
    icon: 'https://img.alicdn.com/tfs/TB1e8gomAL0gK0jSZFAXXcA9pXa-64-64.png',
    getData: () => fetchBlockList('ant-design/ant-design-blocks'),
  },
  {
    id: 'umi-blocks',
    name: 'Umi Community',
    resourceType: 'custom',
    description: '来自 Umi 社区的区块',
    blockType: 'block',
    icon: 'https://img.alicdn.com/tfs/TB1HMEpmuH2gK0jSZFEXXcqMpXa-64-64.png',
    getData: () => fetchUmiBlock('https://blocks.umijs.org/blocks.json'),
  },
  {
    id: 'umi-blocks-template',
    name: 'Umi Community',
    resourceType: 'custom',
    description: '来自 Umi 社区的模板。',
    blockType: 'template',
    icon: 'https://img.alicdn.com/tfs/TB1HMEpmuH2gK0jSZFEXXcqMpXa-64-64.png',
    getData: () => fetchUmiBlock('https://blocks.umijs.org/templates.json'),
  },
];

// 日志带 block 前缀
export const createBlockLog = log => {
  return (logType: 'error' | 'info', info: string) => {
    return log(logType, `${chalk.hex('#40a9ff')('block:')} ${info}`);
  };
};

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
