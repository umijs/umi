import {
  aliasUtils,
  chalk,
  fsExtra,
  getFileCreateInfo,
  getFileLastModifyInfo,
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

type ICreateInfo = Awaited<ReturnType<typeof getFileCreateInfo>>;
type IModifyInfo = Awaited<ReturnType<typeof getFileLastModifyInfo>>;

const response = <R extends unknown>(
  res: PromiseSettledResult<R>,
): res is PromiseFulfilledResult<R> => res.status === 'fulfilled';

const outputUnusedFiles = async (
  unusedFiles: ReturnType<typeof readDirFiles>,
  fileName: string,
  option: {
    verbose?: boolean;
    gitDirPath?: string;
  },
) => {
  if (!unusedFiles?.length) {
    return;
  }
  const { verbose, gitDirPath } = option;

  if (verbose) {
    const records: Record<string, ICreateInfo & IModifyInfo> = {};
    await Promise.allSettled(
      unusedFiles.map(({ filePath }) => {
        return Promise.allSettled([
          getFileCreateInfo(filePath, gitDirPath),
          getFileLastModifyInfo(filePath, gitDirPath),
        ]).then((infos) => {
          const [createInfo, modifyInfo] = infos;

          records[filePath] = {
            ...(response<ICreateInfo>(createInfo)
              ? createInfo.value
              : undefined),
            ...(response<IModifyInfo>(modifyInfo)
              ? modifyInfo.value
              : undefined),
          };
        });
      }),
    );
    fsExtra.writeFileSync(fileName, JSON.stringify(records), 'utf8');
  } else {
    fsExtra.writeFileSync(
      fileName,
      `
      [
        ${unusedFiles.reduce((res, { filePath }, index) => {
          return (
            res + `"${filePath}" ${index !== unusedFiles.length - 1 ? ',' : ''}`
          );
        }, '')}
      ]
      `,
      'utf8',
    );
  }

  // 转化格式 1. ***.ts
  // const content = unusedFiles.map((file, index) => `\n${index + 1}. ${file}`);

  // const str = `
  //   Warning: There are ${unusedFiles.length} unused files:
  //   ${content.join('')}
  //   \nPlease be careful if you want to remove them (¬º-°)¬.\n
  // `;

  // fsExtra.writeFileSync(fileName, str, 'utf8');
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

      // 是否生成文件
      const outFile = api.args?.outFile;
      // 生成文件包含更多文件创建、最新修改等信息
      const verbose = api.args?.verbose;
      // monorepo git目录不在当前项目目录，一般需要添加 ../.. 的path前缀定位
      const pathPrefix =
        typeof api.args?.pathPrefix === 'string' ? api.args.pathPrefix : '';

      const gitDirPath = join(
        cwd,
        pathPrefix
          .split('/')
          .map(() => '..')
          .join('/'),
      );

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
      }).filter(({ filePath }) => !dependenceMap[filePath]);

      if (!unusedFiles.length) {
        console.log(`🎉 ${chalk.green('Good job, no unusedFiles.')}`);
        return;
      }

      logger.warn(`🚨 ${chalk.red('Unused Files found:')}`);
      unusedFiles.forEach((fileItem) => {
        logger.warn(
          ` · ${chalk.yellow(fileItem.filePath, chalk.gray(' -> '))}`,
        );
      });

      if (outFile) {
        const recordJson = `DeadCodeList-${Date.now()}.json`;
        const recordJsonPath = winPath(join(cwd, recordJson));

        if (verbose) logger.wait('generating file...');

        await outputUnusedFiles(unusedFiles, recordJsonPath, {
          verbose,
          gitDirPath,
        });

        logger.warn(
          `👀 ${
            unusedFiles.length
          } unused files, write content to file ${chalk.cyan(recordJsonPath)}`,
        );
      } else {
        logger.warn(`${unusedFiles.length} unused files`);
      }

      logger.info(
        `check dead code end, please be careful if you want to remove them (¬º-°)¬`,
      );
    },
  });
};
