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
umi cache ls [--depth]
`,
    configResolveMode: 'loose',
    fn: ({ args }) => {
      const absTmpFilePath = join(api.paths.absNodeModulesPath, '.cache');
      if (args._[0] === 'clean') {
        fsExtra.removeSync(absTmpFilePath);
      }
      if (args._[0] === 'ls') {
        const plies: number = args.depth === undefined ? 1 : args.depth;
        const dirObj = getDirectorySize({
          directoryPath: absTmpFilePath,
          number: plies + 1,
        });
        const tree: any = {};
        const str = `[${dirObj.size}kb] node_modules/.cache`;
        tree[str] = dirObj.tree;
        console.log(treeify.asTree(tree, true, true));
      }
    },
  });
};

/**
 * 获取目录信息
 * @param directoryPath 目录路径
 * @param number 展示目录层数
 * @param index 标记层数
 * @returns
 */
interface GetDirectorySize {
  directoryPath: string;
  name?: string;
  number?: number;
  index?: number;
}
function getDirectorySize({
  directoryPath,
  number = 2,
  index = 1,
}: GetDirectorySize) {
  const obj: { size: number; tree: any } = {
    size: 0,
    tree: null,
  };
  const isCreateTree = index < number;
  if (isCreateTree) {
    obj.tree = {};
  }

  const files = fsExtra.readdirSync(directoryPath);
  files.forEach(function (file) {
    const filePath = join(directoryPath, file);
    const stats = fsExtra.statSync(filePath);

    if (stats.isFile()) {
      const fileSize = Math.floor(stats.size / 1024);
      obj.size += fileSize;
      if (obj.tree) {
        obj.tree[`[${fileSize}kb] ${file}`] = null;
      }
    } else if (stats.isDirectory()) {
      const objChild = getDirectorySize({
        directoryPath: filePath,
        index: index + 1,
        number,
        name: file,
      });
      if (obj.tree) {
        obj.tree[`[${objChild.size}kb] ${file}`] = objChild.tree;
      }
      obj.size += objChild.size;
    }
  });

  return obj;
}
