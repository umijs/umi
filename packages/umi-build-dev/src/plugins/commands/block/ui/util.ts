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

export const genRouterToTreeData = (routes: IConfig['routes']): TreeData[] =>
  routes
    .map(item =>
      item.path
        ? {
            ...item,
            title: item.path,
            value: item.path,
            key: item.path,
            children: genRouterToTreeData(item.routes || []),
          }
        : undefined,
    )
    .filter(obj => obj);

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
