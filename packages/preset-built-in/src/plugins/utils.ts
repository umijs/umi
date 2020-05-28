import { existsSync } from 'fs';
import { join } from 'path';

type IGetGlobalFile = (opts: {
  absSrcPath: string;
  files: string[];
}) => string[];

/**
 * get global file like (global.js, global.css)
 * @param absSrcPath
 * @param files default load global files
 */
export const getGlobalFile: IGetGlobalFile = ({ absSrcPath, files }) => {
  return files
    .map((file) => join(absSrcPath || '', file))
    .filter((file) => existsSync(file))
    .slice(0, 1);
};

export const isDynamicRoute = (path: string): boolean =>
  !!path?.split('/')?.some?.((snippet) => snippet.startsWith(':'));

/**
 * judge whether ts or tsx file exclude d.ts
 * @param path
 */
export const isTSFile = (path: string): boolean => {
  return (
    typeof path === 'string' &&
    !/\.d\.ts$/.test(path) &&
    /\.(ts|tsx)$/.test(path)
  );
};
