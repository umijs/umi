import fs from 'fs';
import { join } from 'path';
import { winPath } from 'umi-utils';
import got from 'got';
import { getBlockListFromGit } from '../util';
import { BlockData } from '../data.d';

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
 * get BlockList from blockList.json in github repo
 */
export const fetchBlockList = async (repo: string): Promise<BlockData> => {
  try {
    const blocks = await getBlockListFromGit(`https://github.com/${repo}`, true);
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

export async function fetchUmiBlock(url) {
  try {
    const { body } = await got(url);
    return {
      data: JSON.parse(body).list,
      success: true,
    };
  } catch (error) {
    return {
      message: error.message,
      data: undefined,
      success: false,
    };
  }
}
