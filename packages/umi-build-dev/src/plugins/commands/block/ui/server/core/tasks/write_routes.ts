import chalk from 'chalk';
import { IFlowContext, IAddBlockOption } from '../types';
import writeNewRoute from '../../../../../../../utils/writeNewRoute';
import appendBlockToContainer from '../../../../appendBlockToContainer';

const writeRoutes = async (ctx: IFlowContext, args: IAddBlockOption) => {
  const { generator } = ctx.stages;
  const { api, logger } = ctx;
  const { skipModifyRoutes, layout: isLayout, dryRun, index } = args;

  if (generator.needCreateNewRoute && api.config.routes && !skipModifyRoutes) {
    logger.appendLog(
      `🛠 Start write route from ${generator.routePath} to ${api.service.userConfig.file}`,
    );
    // 当前 _modifyBlockNewRouteConfig 只支持配置式路由
    // 未来可以做下自动写入注释配置，支持约定式路由
    const newRouteConfig = api.applyPlugins('_modifyBlockNewRouteConfig', {
      initialValue: {
        name: args.name,
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
      logger.appendLog(`Failed to write route: ${e.message}\n`);
      throw new Error(e);
    }
    logger.appendLog('🎉  Success write route\n');
  }

  if (!generator.isPageBlock) {
    logger.appendLog(
      `🍽  Start write block component ${generator.blockFolderName} import to ${
        generator.entryPath
      }`,
    );
    try {
      appendBlockToContainer({
        entryPath: generator.entryPath,
        blockFolderName: generator.blockFolderName,
        dryRun,
        index,
      });
    } catch (e) {
      logger.appendLog(`Failed write block component: ${e.message}\n`);
      throw new Error(e);
    }
    logger.appendLog('🎉  Success write block component \n');
  }
  const { PORT, BASE_PORT } = process.env;
  // Final: show success message
  const viewUrl = `http://localhost:${BASE_PORT || PORT || '8000'}${generator.path.toLowerCase()}`;
  logger.appendLog(`✨  Probable url ${chalk.cyan(viewUrl)} for view the block.`);
};

export default writeRoutes;
