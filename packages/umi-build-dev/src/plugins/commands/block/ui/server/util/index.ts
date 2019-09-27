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
