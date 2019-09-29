import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from 'umi-types';
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

  // 区块列表缓存
  const blockListCache = {};

  api.onUISocket(async ({ action, failure, success, send }) => {
    blockService.init(send);
    const { type, payload = {}, lang } = action;

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

      // 获得项目 page 下的目录结构
      // 包含文件
      case 'org.umi.block.pageFiles':
        (async () => {
          try {
            success({
              data: blockService.getFilesTreeData(),
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
              data: info,
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
            const { resourceId } = payload as { resourceId: string };
            let data = blockListCache[resourceId];
            if (!data || (payload as { force: boolean }).force) {
              data = await blockService.getBlockList(resourceId, resources);
              blockListCache[resourceId] = data;
            }
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

      // 获取安装中的日志
      case 'org.umi.block.get-adding-blocks-log':
        success({
          data: blockService.getLog(),
          success: true,
        });
        break;

      // 获取安装中区块 url
      case 'org.umi.block.get-adding-block-url':
        success({
          data: blockService.getBlockUrl(),
          success: true,
        });
        break;

      // 取消任务
      case 'org.umi.block.cancel':
        success({
          data: blockService.cancel(),
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
                message: `🎊 ${url} block is adding`,
              },
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

      case 'org.umi.block.checkIfCanAdd':
        (async () => {
          const { item } = payload as {
            item: {
              features: string[];
            };
            type: string;
          };

          /**
           * 获取config 中 react 的判断
           * @param reactPlugin   reactPlugin<any>
           */
          function genReactPluginOpts(reactPlugin?: any) {
            if (reactPlugin && typeof reactPlugin !== 'string') {
              return reactPlugin[1];
            }
            return {};
          }

          /**
           * 是不是有这个 feature tag
           * @param feature
           */
          function haveFeature(feature) {
            return item.features && item.features.includes(feature);
          }

          if (!api.config.routes) {
            failure({
              message:
                lang === 'zh-CN'
                  ? '区块添加不支持约定式路由，请转成配置式路由。'
                  : 'The block adding does not support the conventional route, please convert to a configuration route.',
            });
            return;
          }

          const payloadType = (payload as { type: string }).type === 'block' ? '区块' : '模板';
          const isBigfish = !!process.env.BIGFISH_COMPAT;
          const reactPlugin = (api.config.plugins || []).find(p => {
            return p === 'umi-plugin-react' || p[0] === 'umi-plugin-react';
          });
          const reactPluginOpts = genReactPluginOpts(reactPlugin);

          // antd 特性依赖
          // bigfish 默认开了 antd
          if (haveFeature('antd') && !isBigfish) {
            if (!reactPlugin || !reactPluginOpts.antd) {
              failure({
                message:
                  lang === 'zh-CN'
                    ? `${payloadType}依赖 antd，请安装 umi-plugin-react 插件并开启 antd 。`
                    : 'Block depends on antd, please install umi-plugin-react and enable antd.',
              });
              return;
            }
          }

          // dva 特性依赖
          if (haveFeature('dva')) {
            if (isBigfish) {
              if (!api.config.dva) {
                failure({
                  message: `${payloadType}依赖 dva，请开启 dva 配置。`,
                });
                return;
              }
            }
            if (!reactPlugin || !reactPluginOpts.locale) {
              failure({
                message:
                  lang === 'zh-CN'
                    ? `${payloadType}依赖 dva，请安装 umi-plugin-react 插件并开启 dva 。`
                    : 'Block depends on dva, please install umi-plugin-react and enable dva.',
              });
              return;
            }
          }

          // locale 特性依赖
          if (haveFeature('i18n')) {
            if (isBigfish) {
              if (!api.config.locale) {
                failure({
                  message: `${payloadType}依赖 locale，请开启 locale 配置。`,
                });
                return;
              }
            }
            if (!reactPlugin || !reactPluginOpts.locale) {
              failure({
                message:
                  lang === 'zh-CN'
                    ? `${payloadType}依赖国际化（i18n），请安装 umi-plugin-react 插件并开启 locale 。`
                    : 'Block depends on i18n, please install umi-plugin-react and enable locale.',
              });
              return;
            }
          }
          success({ data: true, success: true });
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
            const { path: targetPath, name } = payload as {
              path: string;
              name: string;
            };
            // 找到具体的 js
            const absTargetPath = api.winPath(
              join(
                api.paths.absPagesPath,
                api.winPath(targetPath).replace(api.winPath(api.paths.pagesPath), ''),
              ),
            );
            const entryPath = api.findJS(absTargetPath, 'index') || api.findJS(absTargetPath, '');
            if (!entryPath) {
              failure({
                message: `未找到文件 ${absTargetPath}!`,
                success: false,
              });
            }
            haveRootBinding(readFileSync(entryPath, 'utf-8'), name).then(exists => {
              success({
                exists,
                success: true,
              });
            });
          } catch (error) {
            failure({
              message: error.message,
              success: false,
            });
          }
        })();
        break;

      /**
       *  C:\GitHub\ant-design-pro\src\pages\Welcome\index.tsx
       * --->
       *   Welcome\index.tsx
       *  用与将路径变化为相对路径
       *  */
      case 'org.umi.block.getRelativePagesPath':
        (async () => {
          const { path: targetPath } = payload as {
            path: string;
          };

          success({
            data: api
              .winPath(targetPath)
              .replace(api.winPath(api.cwd), '')
              .replace(api.winPath(api.paths.pagesPath), '')
              .replace(/\//g, '/'),
            success: true,
          });
        })();
        break;
      default:
        break;
    }
  });
};
