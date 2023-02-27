import {
  aliasUtils,
  getAllFilesSync,
  logger,
  rimraf,
  winPath,
} from '@umijs/utils';
import { writeFileSync } from 'fs';
import madge, { MadgeInstance } from 'madge';
import { join, relative } from 'path';
import { loadConfig } from 'tsconfig-paths';
import type { IApi, IOnGenerateFiles } from '../types';

function winJoin(...args: string[]) {
  return winPath(join(...args));
}

const outputUnusedFiles = (unusedFiles: string[], fileName: string): void => {
  if (!unusedFiles?.length) {
    return;
  }

  // 转化格式 1. ***.ts
  const content = unusedFiles.map((file, index) => `\n${index + 1}. ${file}`);

  const str = `
    \nWarning: There are ${unusedFiles.length} unused files:
    ${content.join('')}
    \nPlease be careful if you want to remove them (¬º-°)¬.\n
  `;

  writeFileSync(fileName, str, 'utf8');
};

interface ITsconfig {
  baseUrl: string;
  paths: Record<string, string[]>;
}

// madge instance 中没有暴露 tree
type MadgeInstanceWithTree = MadgeInstance & {
  tree: Record<string, string[]>;
};

export default (api: IApi) => {
  api.registerCommand({
    name: 'deadcode',
    description: 'check dead code',
    async fn() {
      // setup first, generate .umi
      // clear tmp
      rimraf.sync(api.paths.absTmpPath);

      // generate tmp files
      await api.applyPlugins({
        key: 'onGenerateFiles',
        args: {
          files: null,
          isFirstTime: true,
        } satisfies IOnGenerateFiles,
      });

      // setup end
      // start check deadcode
      // by Yingci老师 https://github.com/umijs/umi-plugin-circular-check
      logger.info('begin check deadCode');

      const cwd = api.cwd;
      const tsconfig = (await loadConfig(cwd)) as ITsconfig;

      const exclude: RegExp[] = [/node_modules/, /\.d\.ts$/, /\.umi/];
      const isExclude = (path: string) => {
        return exclude.some((reg) => reg.test(path));
      };

      const userAlias = api.config.alias;
      const parsedAlias = aliasUtils.parseCircleAlias({
        alias: userAlias,
      });

      const filteredAlias = Object.keys(parsedAlias).reduce<ITsconfig['paths']>(
        (acc, key) => {
          const value = parsedAlias[key];
          if (isExclude(value)) {
            return acc;
          }
          if (tsconfig.paths?.[key]) {
            return acc;
          }
          const tsconfigValue = [join(relative(cwd, value), '/*')];
          const tsconfigKey = `${key}/*`;
          if (tsconfig.paths?.[tsconfigKey]) {
            return acc;
          }
          acc[tsconfigKey] = tsconfigValue;
          return acc;
        },
        {},
      );

      // containing `src` folders are supported only
      if (!api.appData.hasSrcDir) {
        throw new Error(`Only supports projects containing "src" folders.`);
      }
      const devTmpDir = join(api.paths.absSrcPath, '.umi');
      const entryFile = join(devTmpDir, 'umi.ts');
      const exportsFile = join(devTmpDir, 'exports.ts');
      // get madgeInstance
      const res = (await madge(entryFile, {
        tsConfig: {
          compilerOptions: {
            baseUrl: tsconfig.baseUrl,
            paths: {
              ...filteredAlias,
              ...tsconfig.paths,
              umi: [exportsFile],
              '@umijs/max': [exportsFile],
            },
            target: 'esnext',
            module: 'esnext',
            moduleResolution: 'node',
            importHelpers: true,
            jsx: 'react-jsx',
            esModuleInterop: true,
            strict: true,
            resolveJsonModule: true,
            allowSyntheticDefaultImports: true,
          },
        },
        fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
        excludeRegExp: exclude,
        baseDir: cwd,
      })) as MadgeInstanceWithTree;

      // get dependence map
      // treeMap { src/*: [] } 需要把 key 转化为绝对路径
      const treeMap = res.tree;
      const dependenceMap = Object.keys(treeMap).reduce(
        (acc: Record<string, boolean>, key: string) => {
          const path = winJoin(api.paths.cwd, key);
          acc[path] = true;
          return acc;
        },
        {},
      );

      // get unUseFiles
      const unUseFiles: string[] = [];
      getAllFilesSync(api.paths.absSrcPath, [/\.umi/], (path: string) => {
        if (!dependenceMap[path]) {
          unUseFiles.push(path);
        }
      });

      const filePath = winJoin(
        api.paths.absSrcPath,
        `DeadCodeList-${Date.now()}.txt`,
      );

      logger.info(`write file ${filePath}`);
      outputUnusedFiles(unUseFiles, filePath);

      logger.info(
        `check dead code end, please be careful if you want to remove them (¬º-°)¬`,
      );
    },
  });
};
