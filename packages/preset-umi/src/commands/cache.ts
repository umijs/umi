import { fsExtra, logger } from '@umijs/utils';
import { join, relative } from 'path';
import treeify, { type TreeObject } from '../../compiled/treeify';
import { IApi } from '../types';

const details = `
umi cache
# clear cache directory
umi cache clean
# display directory information, --depth is the number of directory levels
umi cache ls [--depth <depth>]
`;

export default (api: IApi) => {
  api.registerCommand({
    name: 'cache',
    description: 'run the script commands, manage umi cache',
    details,
    configResolveMode: 'loose',
    fn: ({ args }) => {
      const absCachePath = join(
        api.cwd,
        api.config.cacheDirectoryPath || 'node_modules/.cache',
      );
      const position = relative(api.cwd, absCachePath);
      if (fsExtra.existsSync(absCachePath)) {
        if (args._[0] === 'clean') {
          fsExtra.removeSync(absCachePath);
          logger.ready(`[umi cache] cache directory is cleaned (${position})`);
        } else if (args._[0] === 'ls') {
          const depth: number = args.depth ?? 1;
          const dirObj = getDirectorySize({
            dir: absCachePath,
            depth: depth + 1,
          });
          const tree: Tree = {};
          const str = `[${getSize(dirObj.size)}] ${position}`;
          tree[str] = dirObj.tree;
          logger.info(
            `[umi cache] dir info\n${treeify.asTree(
              tree as TreeObject,
              true,
              true,
            )}`,
          );
        }
      } else {
        logger.warn(`[umi cache] unknown command ${args._[0]}`);
        console.log(details);
      }
    },
  });
};

type Tree = null | { [key: string]: null | Tree };

interface IGetDirectorySize {
  dir: string;
  depth?: number;
  current?: number;
}
function getDirectorySize({ dir, depth = 2, current = 1 }: IGetDirectorySize) {
  const obj: {
    size: number;
    tree: Tree;
  } = {
    size: 0,
    tree: null,
  };
  const needCreateTree = current < depth;
  if (needCreateTree) {
    obj.tree = {};
  }
  const files = fsExtra.readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stats = fsExtra.statSync(filePath);

    if (stats.isFile()) {
      const fileSize = Math.floor(stats.size / 1024);
      obj.size += fileSize;
      if (obj.tree) {
        obj.tree[`[${getSize(fileSize)}] ${file}`] = null;
      }
    } else {
      const objChild = getDirectorySize({
        dir: filePath,
        current: current + 1,
        depth,
      });
      if (obj.tree) {
        obj.tree[`[${getSize(objChild.size)}] ${file}`] = objChild.tree;
      }
      obj.size += objChild.size;
    }
  });

  return obj;
}

function getSize(size: number) {
  if (size > 1024) {
    return `${(size / 1024).toFixed(2)} MB`;
  }
  return `${size} KB`;
}
