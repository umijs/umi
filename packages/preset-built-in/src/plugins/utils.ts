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
