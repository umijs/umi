import { winPath } from 'umi-utils';
import { join } from 'path';
import { IFlowContext, IAddBlockOption } from '../types';
import { getNameFromPkg } from '../../../../getBlockGenerator';

const generatorFunc = async (ctx: IFlowContext, args: IAddBlockOption) => {
  const { logger, api } = ctx;
  const { debug } = api;

  const { dryRun, page: isPage, js, execution = 'shell', uni18n } = args;

  // opts.remoteLog('Generate files');  // TODO: 增加日志
  logger.start('🔥  Generate files');
  logger.stopAndPersist();

  const BlockGenerator = require('../../../../getBlockGenerator').default(ctx.api);
  const { pkg, sourcePath, filePath, routePath, templateTmpDirPath } = ctx.stages.blockCtx;

  let isPageBlock = pkg.blockConfig && pkg.blockConfig.specVersion === '0.1';
  if (isPage !== undefined) {
    // when user use `umi block add --page`
    isPageBlock = isPage;
  }
  debug(`isPageBlock: ${isPageBlock}`);
  const generator = new BlockGenerator(args._ ? args._.slice(2) : [], {
    sourcePath,
    path: filePath,
    routePath,
    blockName: getNameFromPkg(pkg),
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
    logger.fail();
    throw new Error(e);
  }

  // write dependencies
  if (pkg.blockConfig && pkg.blockConfig.dependencies) {
    const subBlocks = pkg.blockConfig.dependencies;
    try {
      await Promise.all(
        subBlocks.map((block: string) => {
          const subBlockPath = join(templateTmpDirPath, block);
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
      logger.fail();
      throw new Error(e);
    }
  }
  logger.succeed();

  // 调用 sylvanas 转化 ts
  if (js) {
    // opts.remoteLog('TypeScript to JavaScript'); // TODO: add log
    logger.start('🤔  TypeScript to JavaScript');
    require('../../../../tsTojs').default(generator.blockFolderPath);
    logger.succeed();
  }

  if (uni18n) {
    logger.start('🌎  remove i18n code');
    require('./remove-locale').default(generator.blockFolderPath, uni18n);
    logger.succeed();
  }

  ctx.stages.generator = generator;
};

export default generatorFunc;
