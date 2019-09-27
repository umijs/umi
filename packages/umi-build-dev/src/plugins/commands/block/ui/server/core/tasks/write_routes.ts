import clipboardy from 'clipboardy';
import chalk from 'chalk';
import { IFlowContext, IAddBlockOption } from '../types';
import writeNewRoute from '../../../../../../../utils/writeNewRoute';
import appendBlockToContainer from '../../../../appendBlockToContainer';

const writeRoutes = async (ctx: IFlowContext, args: IAddBlockOption) => {
  const { generator } = ctx.stages;
  const { api, logger } = ctx;
  const { skipModifyRoutes, layout: isLayout, dryRun } = args;

  if (generator.needCreateNewRoute && api.config.routes && !skipModifyRoutes) {
    logger.start(`⛱  Write route ${generator.routePath} to ${api.service.userConfig.file}`);
    // 当前 _modifyBlockNewRouteConfig 只支持配置式路由
    // 未来可以做下自动写入注释配置，支持约定式路由
    const newRouteConfig = api.applyPlugins('_modifyBlockNewRouteConfig', {
      initialValue: {
        path: generator.routePath.toLowerCase(),
        component: `.${generator.path}`,
        ...(isLayout ? { routes: [] } : {}),
      },
    });
    try {
      if (!dryRun) {
        writeNewRoute(newRouteConfig, api.service.userConfig.file, api.paths.absSrcPath);
      }
    } catch (e) {
      logger.fail();
      throw new Error(e);
    }
    logger.succeed();
  }

  if (!generator.isPageBlock) {
    logger.start(
      `Write block component ${generator.blockFolderName} import to ${generator.entryPath}`,
    );
    try {
      appendBlockToContainer({
        entryPath: generator.entryPath,
        blockFolderName: generator.blockFolderName,
        dryRun,
      });
    } catch (e) {
      logger.fail();
      throw new Error(e);
    }
    logger.succeed();
  }

  // Final: show success message
  const viewUrl = `http://localhost:${process.env.PORT || '8000'}${generator.path.toLowerCase()}`;
  try {
    clipboardy.writeSync(viewUrl); // TODO: clipboardy 相关应该去掉
    logger.success(
      `probable url ${chalk.cyan(viewUrl)} ${chalk.dim(
        '(copied to clipboard)',
      )} for view the block.`,
    );
  } catch (e) {
    logger.error('copy to clipboard failed');
  }
};

export default writeRoutes;
