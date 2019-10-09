import assert from 'assert';
import chalk from 'chalk';
import { IApi } from 'umi-types';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import ora from 'ora';
import { merge } from 'lodash';
import getNpmRegistry from 'getnpmregistry';
import clipboardy from 'clipboardy';
import { winPath } from 'umi-utils';
import { getParsedData, makeSureMaterialsTempPathExist } from './download';
import writeNewRoute from '../../../utils/writeNewRoute';
import { getNameFromPkg } from './getBlockGenerator';
import appendBlockToContainer from './appendBlockToContainer';
import { gitClone, gitUpdate } from './util';
import installDependencies from './installDependencies';

export interface CtxTypes {
  repo?: any;
  branch?: any;
  path?: string;
  id?: string;
  routePath?: string;
  isLocal?: boolean;
  sourcePath?: string;
  repoExists?: boolean;
  filePath?: string;
  templateTmpDirPath?: string;
  pkg?: { blockConfig: { [key: string]: any } };
}
export interface AddBlockOption {
  // 从命令行传入会有这个
  _?: string[];
  // 区块的名称和安装的地址
  url?: string;
  // 安装区块需要的分支
  branch?: string;

  // 安装的文件地址
  path?: string;
  // 区块安装的名称
  // --page false 是有效
  name?: string;
  // 安装的路由地址
  routePath?: string;
  // 包管理器
  npmClient?: string;
  // 测试运行
  dryRun?: boolean;
  // 跳过安装依赖
  skipDependencies?: boolean;
  // 跳过修改路由
  skipModifyRoutes?: boolean;
  // 是不是区块
  page?: boolean;
  // 如果是 layout 会在路由中生成一个 children
  layout?: boolean;
  // npm 源
  registry?: string;
  // 把 ts 转化为 js
  js?: boolean;
  // 删除区块的 i18n 代码
  uni18n?: boolean;
  // 执行环境，默认是 shell ，如果是 auto，发生冲突直接报错
  // 在 ci 与 function 中执行可以设置为 auto
  execution?: 'shell' | 'auto';

  index?: number;

  // 传输 log 用
  remoteLog?: (log: string) => void;
}

// fix demo => /demo
export const addPrefix = path => {
  if (!/^\//.test(path)) {
    return `/${path}`;
  }
  return path;
};

export async function getCtx(url, args: AddBlockOption = {}, api: IApi): Promise<CtxTypes> {
  const { debug, config } = api;
  debug(`get url ${url}`);

  const ctx: CtxTypes = await getParsedData(url, { ...(config.block || {}), ...args });

  if (!ctx.isLocal) {
    const blocksTempPath = makeSureMaterialsTempPathExist(args.dryRun);
    const templateTmpDirPath = join(blocksTempPath, ctx.id);
    merge(ctx, {
      routePath: args.routePath,
      sourcePath: join(templateTmpDirPath, ctx.path),
      branch: args.branch || ctx.branch,
      templateTmpDirPath,
      blocksTempPath,
      repoExists: existsSync(templateTmpDirPath),
    });
  } else {
    merge(ctx, {
      routePath: args.routePath,
      templateTmpDirPath: dirname(url),
    });
  }

  return ctx;
}

async function add(
  args: AddBlockOption = {},
  opts: AddBlockOption = {},
  api: IApi & {
    sendLog: (info: string) => void;
  },
) {
  const { log, paths, debug, config, applyPlugins, sendLog } = api;
  const blockConfig: {
    npmClient?: string;
  } = config.block || {};
  const addLogs = [];

  const getSpinner = () => {
    const spinner = ora();
    return {
      ...spinner,
      succeed: (info?: string) => spinner.succeed(info),
      start: info => {
        if (sendLog) {
          sendLog(info);
        }
        spinner.start(info);
        addLogs.push(info);
      },
      fail: (info?: string) => spinner.fail(info),
      stopAndPersist: (option?: any) => spinner.stopAndPersist(option),
    };
  };

  const spinner = getSpinner();

  if (!opts.remoteLog) {
    opts.remoteLog = () => {};
  }

  // 1. parse url and args
  spinner.start('😁  Parse url and args');

  const { url } = args;
  assert(url, `run ${chalk.cyan.underline('umi help block')} to checkout the usage`);

  const useYarn = existsSync(join(paths.cwd, 'yarn.lock'));
  const defaultNpmClient = blockConfig.npmClient || (useYarn ? 'yarn' : 'npm');
  debug(`defaultNpmClient: ${defaultNpmClient}`);
  debug(`args: ${JSON.stringify(args)}`);

  // get faster registry url
  const registryUrl = await getNpmRegistry();

  const {
    path,
    name,
    routePath,
    index,
    npmClient = defaultNpmClient,
    dryRun,
    skipDependencies,
    skipModifyRoutes,
    page: isPage,
    layout: isLayout,
    registry = registryUrl,
    js,
    execution = 'shell',
    uni18n,
  } = args;

  const ctx = await getCtx(url, args, api);

  spinner.succeed();

  // 2. clone git repo
  if (!ctx.isLocal && !ctx.repoExists) {
    opts.remoteLog('Clone the git repo');
    await gitClone(ctx, spinner);
  }

  // 3. update git repo
  if (!ctx.isLocal && ctx.repoExists) {
    try {
      opts.remoteLog('Update the git repo');
      await gitUpdate(ctx, spinner);
    } catch (error) {
      log.info('发生错误，请尝试 `umi block clear`');
    }
  }

  // make sure sourcePath exists
  assert(existsSync(ctx.sourcePath), `${ctx.sourcePath} don't exists`);

  // get block's package.json
  const pkgPath = join(ctx.sourcePath, 'package.json');
  if (!existsSync(pkgPath)) {
    throw new Error(`not find package.json in ${this.sourcePath}`);
  } else {
    // eslint-disable-next-line
    ctx.pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  }

  // setup route path
  if (!path) {
    const blockName = getNameFromPkg(ctx.pkg);
    if (!blockName) {
      log.error("not find name in block's package.json");
      return;
    }
    ctx.filePath = `/${blockName}`;
    log.info(`Not find --path, use block name '${ctx.filePath}' as the target path.`);
  } else {
    ctx.filePath = winPath(path);
  }

  ctx.filePath = addPrefix(ctx.filePath);

  // 如果 ctx.routePath 不存在，使用 filePath
  if (!routePath) {
    ctx.routePath = ctx.filePath;
  }

  ctx.routePath = addPrefix(ctx.routePath);
  // 4. install additional dependencies
  // check dependencies conflict and install dependencies
  // install
  opts.remoteLog('📦  Install extra dependencies');
  spinner.start('📦  install dependencies package');
  await installDependencies(
    { npmClient, registry, applyPlugins, paths, debug, dryRun, spinner, skipDependencies },
    ctx,
  );
  spinner.succeed();

  // 5. run generator
  opts.remoteLog('🔥  Generate files');
  spinner.start('🔥  Generate files');
  spinner.stopAndPersist();
  const BlockGenerator = require('./getBlockGenerator').default(api);
  let isPageBlock = ctx.pkg.blockConfig && ctx.pkg.blockConfig.specVersion === '0.1';
  if (isPage !== undefined) {
    // when user use `umi block add --page`
    isPageBlock = isPage;
  }
  debug(`isPageBlock: ${isPageBlock}`);
  const generator = new BlockGenerator(args._ ? args._.slice(2) : [], {
    sourcePath: ctx.sourcePath,
    path: ctx.filePath,
    routePath: ctx.routePath,
    blockName: name || getNameFromPkg(ctx.pkg),
    isPageBlock,
    dryRun,
    execution,
    env: {
      cwd: api.cwd,
    },
    resolved: winPath(__dirname),
  });
  try {
    await generator.run();
  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }

  // write dependencies
  if (ctx.pkg.blockConfig && ctx.pkg.blockConfig.dependencies) {
    const subBlocks = ctx.pkg.blockConfig.dependencies;
    try {
      await Promise.all(
        subBlocks.map((block: string) => {
          const subBlockPath = join(ctx.templateTmpDirPath, block);
          debug(`subBlockPath: ${subBlockPath}`);
          return new BlockGenerator(args._.slice(2), {
            sourcePath: subBlockPath,
            path: isPageBlock ? generator.path : join(generator.path, generator.blockFolderName),
            // eslint-disable-next-line
            blockName: getNameFromPkg(require(join(subBlockPath, 'package.json'))),
            isPageBlock: false,
            dryRun,
            env: {
              cwd: api.cwd,
            },
            routes: api.config.routes,
            resolved: winPath(__dirname),
          }).run();
        }),
      );
    } catch (e) {
      spinner.fail();
      throw new Error(e);
    }
  }
  spinner.succeed();

  // 调用 sylvanas 转化 ts
  if (js) {
    opts.remoteLog('🤔  TypeScript to JavaScript');
    spinner.start('🤔  TypeScript to JavaScript');
    require('./tsTojs').default(generator.blockFolderPath);
    spinner.succeed();
  }

  if (uni18n) {
    opts.remoteLog('🌎  remove i18n code');
    spinner.start('🌎  remove i18n code');
    require('./remove-locale').default(generator.blockFolderPath, uni18n);
    spinner.succeed();
  }

  // 6. write routes
  if (generator.needCreateNewRoute && api.config.routes && !skipModifyRoutes) {
    opts.remoteLog('⛱  Write route');

    spinner.start(`⛱  Write route ${generator.routePath} to ${api.service.userConfig.file}`);
    // 当前 _modifyBlockNewRouteConfig 只支持配置式路由
    // 未来可以做下自动写入注释配置，支持约定式路由
    const newRouteConfig = applyPlugins('_modifyBlockNewRouteConfig', {
      initialValue: {
        path: generator.routePath.toLowerCase(),
        component: `.${generator.path}`,
        ...(isLayout ? { routes: [] } : {}),
      },
    });
    try {
      if (!dryRun) {
        writeNewRoute(newRouteConfig, api.service.userConfig.file, paths.absSrcPath);
      }
    } catch (e) {
      spinner.fail();
      throw new Error(e);
    }
    spinner.succeed();
  }

  // 6. import block to container
  if (!generator.isPageBlock) {
    spinner.start(
      `Write block component ${generator.blockFolderName} import to ${generator.entryPath}`,
    );
    try {
      appendBlockToContainer({
        entryPath: generator.entryPath,
        blockFolderName: generator.blockFolderName,
        dryRun,
        index,
      });
    } catch (e) {
      spinner.fail();
      throw new Error(e);
    }
    spinner.succeed();
  }

  // Final: show success message
  const { PORT, BASE_PORT } = process.env;
  // Final: show success message
  const viewUrl = `http://localhost:${BASE_PORT || PORT || '8000'}${generator.path.toLowerCase()}`;

  try {
    clipboardy.writeSync(viewUrl);
    log.success(
      `✨  Probable url ${chalk.cyan(viewUrl)} ${chalk.dim(
        '(copied to clipboard)',
      )} for view the block.`,
    );
  } catch (e) {
    log.success(`✨  Probable url ${chalk.cyan(viewUrl)} for view the block.`);
    log.error('copy to clipboard failed');
  }
  // return ctx and generator for test
  return {
    generator,
    ctx,
    logs: addLogs,
  };
}

export default add;
