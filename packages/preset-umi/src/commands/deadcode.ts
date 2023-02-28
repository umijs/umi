import {
  aliasUtils,
  chalk,
  fsExtra,
  installWithNpmClient,
  logger,
  readDirFiles,
  resolve,
  rimraf,
  tsconfigPaths,
  winPath,
} from '@umijs/utils';
import type { MadgeConfig, MadgeInstance, MadgePath } from 'madge';
import { dirname, join, relative } from 'path';
import type { IApi, IOnGenerateFiles } from '../types';

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

  fsExtra.writeFileSync(fileName, str, 'utf8');
};

interface ITsconfig {
  baseUrl: string;
  paths: Record<string, string[]>;
}

interface IMadgeInstance extends MadgeInstance {
  tree: Record<string, string[]>;
}

type MadgeFunc = (
  path: MadgePath,
  config: MadgeConfig,
) => Promise<IMadgeInstance>;

export default (api: IApi) => {
  api.registerCommand({
    name: 'deadcode',
    description: 'check dead code',
    async fn() {
      // install `madge`(10MB) on demand
      const pkg = api.pkg;
      const userDeps = {
        ...pkg?.dependencies,
        ...pkg?.devDependencies,
      };
      const MADGE_NAME = 'madge';
      const MADGE_VERSION = '6.0.0';
      const isInstalled = Object.keys(userDeps).includes(MADGE_NAME);
      if (!isInstalled) {
        pkg.devDependencies ||= {};
        pkg.devDependencies[MADGE_NAME] = MADGE_VERSION;
        fsExtra.writeFileSync(
          api.pkgPath,
          `${JSON.stringify(pkg, null, 2)}\n`,
          'utf-8',
        );
        logger.info(
          `Installing ${chalk.blue(MADGE_NAME)} (required by deadcode) ...`,
        );
        installWithNpmClient({
          cwd: api.cwd,
          npmClient: api.appData.npmClient,
        });
      }

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
      const tsconfig = (await tsconfigPaths.loadConfig(cwd)) as ITsconfig;

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
      // get madge package
      const madgePkg = dirname(
        resolve.sync(`${MADGE_NAME}/package.json`, {
          basedir: cwd,
        }),
      );
      const madge = require(madgePkg) as MadgeFunc;
      // get madgeInstance
      const res = await madge(entryFile, {
        tsConfig: {
          compilerOptions: {
            baseUrl: tsconfig.baseUrl,
            paths: {
              ...filteredAlias,
              ...tsconfig.paths,
              umi: [exportsFile],
              '@umijs/max': [exportsFile],
              // 适配 bigfish
              ...(api.appData?.umi?.importSource
                ? {
                    [api.appData.umi.importSource]: [exportsFile],
                  }
                : {}),
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
      });

      // get dependence map
      // treeMap { src/*: [] } 需要把 key 转化为绝对路径
      const treeMap = res.tree;
      const dependenceMap = Object.keys(treeMap).reduce(
        (acc: Record<string, boolean>, key) => {
          const path = winPath(join(api.paths.cwd, key));
          acc[path] = true;
          return acc;
        },
        {},
      );

      // 不在 dependenceMap 里, 且不在 fileExcludeNames 里
      const unusedFiles = readDirFiles({
        dir: api.paths.absSrcPath,
        exclude,
      })
        .filter(({ filePath }) => !dependenceMap[filePath])
        .map((file) => {
          const relativePath = relative(cwd, file.filePath);
          return relativePath;
        });

      const filePath = winPath(join(cwd, `DeadCodeList-${Date.now()}.txt`));
      logger.info(`write file ${filePath}`);
      outputUnusedFiles(unusedFiles, filePath);

      logger.info(
        `check dead code end, please be careful if you want to remove them (¬º-°)¬`,
      );
    },
  });
};
