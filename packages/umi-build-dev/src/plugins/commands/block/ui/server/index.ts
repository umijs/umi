import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from 'umi-types';
import uppercamelcase from 'uppercamelcase';
import { Resource, AddBlockParams } from '../../data.d';
import clearGitCache from '../../clearGitCache';
import Block from './core/Block';
import { DEFAULT_RESOURCES } from './util';
import haveRootBinding from '../../sdk/haveRootBinding';

export interface IApiBlock extends IApi {
  sendLog: (info: string) => void;
}

export default (api: IApi) => {
  const blockService = new Block(api);

  api.onUISocket(async ({ action, failure, success }) => {
    const { type, payload = {} } = action;

    // 区块资源可配置
    let resources: Resource[] = [];
    resources = api.applyPlugins('addBlockUIResource', {
      initialValue: DEFAULT_RESOURCES,
    });
    resources = api.applyPlugins('modifyBlockUIResources', {
      initialValue: resources,
    });

    switch (type) {
      // 获得项目的路由
      case 'org.umi.block.routes':
        (async () => {
          try {
            const routers = blockService.depthRouterConfig();
            success({
              data: routers,
              success: true,
            });
          } catch (error) {
            failure({
              message: error.message,
              success: false,
            });
          }
        })();
        break;

      // 获得项目 page 下的目录结构
      case 'org.umi.block.pageFolders':
        (async () => {
          try {
            success({
              data: blockService.getFolderTreeData(),
              success: true,
            });
          } catch (error) {
            failure({
              message: error.message,
              success: false,
            });
          }
        })();
        break;

      // 清空缓存
      case 'org.umi.block.clear':
        (async () => {
          try {
            const info = clearGitCache(payload, api);
            success({
              data: info.replace(/\[33m/g, '').replace(/\[39m/g, ''),
              success: true,
            });
          } catch (error) {
            failure({
              message: error.message,
              success: false,
            });
          }
        })();
        break;

      // 区块获得数据源
      case 'org.umi.block.resource':
        success({
          data: resources,
          success: true,
        });
        break;

      // 获取区块列表
      case 'org.umi.block.list':
        (async () => {
          try {
            const data = await blockService.getBlockList(payload.resourceId, resources);
            success({
              data,
              success: true,
            });
          } catch (error) {
            failure({
              message: error.message,
              success: false,
            });
          }
        })();
        break;

      // 获取缓存中的日志
      case 'org.umi.block.get-pre-blocks-log':
        success({
          data: blockService.getLog(),
          success: true,
        });
        break;

      // 获取区块 url
      case 'org.umi.block.get-adding-block-url':
        success({
          data: blockService.getBlockUrl(),
          success: true,
        });
        break;

      // 区块添加
      case 'org.umi.block.add':
        (async () => {
          const { url } = payload as AddBlockParams;
          // 执行逻辑
          try {
            await blockService.run({ ...payload });
            success({
              data: {
                message: `🎊 Adding block '${url}' is success`,
              },
              success: true,
            });
          } catch (error) {
            console.log(99999);
            console.error(error);
            failure({
              message: error.message,
              success: false,
            });
          }
        })();
        break;

      // 检查路由是否存在
      case 'org.umi.block.checkExistRoute':
        const { path } = payload as AddBlockParams;
        success({
          exists: blockService.routeExists(path),
          success: true,
        });
        break;

      // 检查文件路径是否存在
      case 'org.umi.block.checkExistFilePath':
        try {
          const { path: blockPath } = payload as AddBlockParams;
          // 拼接真实的路径，应该是项目的 pages 目录下
          const absPath = api.winPath(join(api.paths.absPagesPath, blockPath));
          success({
            exists: existsSync(absPath),
            success: true,
          });
        } catch (error) {
          failure({
            message: error.message,
            success: false,
          });
        }
        break;

      // 检查文件里使用某个变量名是否可以
      case 'org.umi.block.checkBindingInFile':
        (async () => {
          try {
            const { path, name } = payload;
            const absPath = api.winPath(join(api.paths.absPagesPath, path));
            success({
              exists: haveRootBinding(absPath, uppercamelcase(name)),
            });
          } catch (error) {
            log(error);
            failure({
              message: error.message,
              success: false,
            });
          }
        })();
        break;

      default:
        break;
    }
  });
};
