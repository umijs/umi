import { join } from 'path';
import treeify from 'treeify';
import { IApi } from 'umi';
import { fsExtra } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.registerCommand({
    name: 'cache',
    description: 'run the script commands, manage umi cache',
    details: `
umi cache

# clear cache directory
umi cache clean

# display directory information, --depth is the number of directory levels
umi cache ls [--depth <depth>]
`,
    configResolveMode: 'loose',
    fn: ({ args }) => {
      const absCachePath = join(api.paths.absNodeModulesPath, '.cache');
      if (args._[0] === 'clean') {
        fsExtra.removeSync(absCachePath);
      } else if (args._[0] === 'ls') {
        const depth: number = args.depth ?? 1;
        const dirObj = getDirectorySize({
          dir: absCachePath,
          depth: depth + 1,
        });
        const tree: any = {};
        const str = `[${getSize(dirObj.size)}] node_modules/.cache`;
        tree[str] = dirObj.tree;
        console.log(treeify.asTree(tree, true, true));
      }
    },
  });
};

interface GetDirectorySize {
  dir: string;
  depth?: number;
  current?: number;
}
function getDirectorySize({ dir, depth = 2, current = 1 }: GetDirectorySize) {
  const obj: { size: number; tree: any } = {
    size: 0,
    tree: null,
  };
  const isCreateTree = current < depth;
  if (isCreateTree) {
    obj.tree = {};
  }
  fsExtra.ensureDirSync(dir);
  const files = fsExtra.readdirSync(dir);

  files.forEach(function (file) {
    const filePath = join(dir, file);
    const stats = fsExtra.statSync(filePath);

    if (stats.isFile()) {
      const fileSize = Math.floor(stats.size / 1024);
      obj.size += fileSize;
      if (obj.tree) {
        obj.tree[`[${getSize(fileSize)}] ${file}`] = null;
      }
    } else if (stats.isDirectory()) {
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
