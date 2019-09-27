import chalk from 'chalk';
import { existsSync } from 'fs';
import { IApi } from 'umi-types';
import { join } from 'path';
import uppercamelcase from 'uppercamelcase';
import { depthRouterConfig, routeExists } from '../util';
import { getFolderTreeData, fetchBlockList } from './util';
import { Resource, AddBlockParams } from '../data.d';
import clearGitCache from '../clearGitCache';
import addBlock from '../addBlock';
import LogServe from './LogServer';
import haveRootBinding from '../sdk/haveRootBinding';

export interface IApiBlock extends IApi {
  sendLog: (info: string) => void;
}

/**
 * 从 resource 中获取数据源
 */
const getBlockList = async (
  payload: {
    resourceId: string;
  },
  list: Resource[],
) => {
  const { resourceId } = payload;
  const resource = list.find(item => item.id === resourceId);
  if (resource) {
    if (resource.resourceType === 'custom') {
      const { data } = await resource.getData();
      return data;
    }
    return [];
  }
  throw new Error(`not find resource ${resourceId}`);
};

export default (api: IApiBlock) => {
  const { log } = api.log;

  api.addUIPlugin(require.resolve('../../../../../src/plugins/commands/block/ui/dist/ui.umd.js'));

  const defaultResources: Resource[] = [
    {
      id: 'ant-design-pro',
      name: 'Ant Design Pro',
      resourceType: 'custom',
      blockType: 'template',
      getData: () => fetchBlockList('ant-design/pro-blocks'),
    },
    {
      id: 'ant-design-blocks',
      name: 'Ant Design',
      resourceType: 'custom',
      blockType: 'block',
      getData: () => fetchBlockList('ant-design/ant-design-blocks'),
    },
  ];

  api.onUISocket(async ({ action, failure, success, send, ...rest }) => {
    const { type, payload = {} } = action;
    const logServe = new LogServe();

    /**
     * 初始化一些特殊的 function
     * 这个 方法可以快速的 log，并且带有 block 的前缀
     * @param logType
     * @param info
     */
    const uiLog = (logType: 'error' | 'info', info: string) =>
      rest.log(logType, `${chalk.hex('#40a9ff')('block:')} ${info}`);

    // 交给插件来修改这些数据
    let resources: Resource[] = [];
    resources = api.applyPlugins('addBlockUIResource', {
      initialValue: defaultResources,
    });
    resources = api.applyPlugins('modifyBlockUIResources', {
      initialValue: resources,
    });
    // ---- end ----

    /**
     * 向 客户端发送日志。
     */
    const sendAddBlockLog = logStr => {
      // 暂存到内存中
      logServe.push(logStr);
      send({
        type: 'org.umi.block.add-blocks-log',
        payload: {
          data: logStr,
          success: true,
        },
      });
    };

    switch (type) {
      // 区块获得项目的路由
      case 'org.umi.block.routes':
        (async () => {
          try {
            log(`🕵️‍ get routes from ${chalk.yellow(api.cwd)}`);
            const routers = depthRouterConfig(api.config.routes);
            success({
              data: routers,
              success: true,
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

      // 获得项目 page 下的目录结构
      case 'org.umi.block.pageFolders':
        (async () => {
          try {
            log(`🕵️‍ get pageFolders from ${chalk.yellow(api.paths.absPagesPath)}`);
            const folderTreeData = getFolderTreeData(api.paths.absPagesPath);
            folderTreeData.unshift({
              title: '/',
              value: '/',
              key: '/',
            });
            success({
              data: folderTreeData,
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

      // 清空缓存
      case 'org.umi.block.clear':
        (async () => {
          try {
            log('block: clear cache');
            const info = clearGitCache(payload, api);
            uiLog('info', info);
            success({
              data: info.replace(/\[33m/g, '').replace(/\[39m/g, ''),
              success: true,
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

      // 区块获得数据源 写死的展示不用处理错误逻辑
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
            const data = await getBlockList(payload as { resourceId: string }, resources);
            success({
              data,
              success: true,
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

      // 获取缓存中的日志
      case 'org.umi.block.get-pre-blocks-log':
        log(`🏸 find logs ${logServe.getList().join('\n')}`);
        success({
          data: logServe.getList(),
          success: true,
        });
        break;

      // 获取缓存中的日志
      case 'org.umi.block.get-adding-block-url':
        success({
          data: logServe.getBlockUrl(),
          success: true,
        });
        break;

      // 区块添加
      case 'org.umi.block.add':
        (async () => {
          const { url, path } = payload as AddBlockParams;
          // 初始化区块
          logServe.clear();
          logServe.setBlockUrl(url);

          // 执行逻辑
          const addLogMessage = `🌼  Adding block ${chalk.magenta(url || path)} as ${path} ...`;
          uiLog('info', addLogMessage);
          log(addLogMessage);
          api.sendLog = sendAddBlockLog;
          try {
            const addInfo = await addBlock({ ...payload, url, execution: 'auto' }, {}, api);
            const successMessage = `🎊 Adding block '${url}' is success`;
            success({
              data: {
                log: addInfo.logs,
                message: successMessage,
              },
              success: true,
            });
            // 成功之后清空
            logServe.clear();
            log(successMessage);
            sendAddBlockLog(successMessage);
            uiLog('info', successMessage);
          } catch (error) {
            failure({
              message: error.message,
              success: false,
            });
            uiLog('error', `😰  Adding block is fail ${error.message}`);
            log(error);
          }
        })();
        break;

      // 检查路由是否存在
      case 'org.umi.block.checkExistRoute':
        (async () => {
          try {
            const { path } = payload as AddBlockParams;
            log(`🔎 check exist route ${chalk.yellow(path)}`);
            success({
              exists: routeExists(path, api.config.routes),
              success: true,
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

      // 检查文件路径是否存在
      case 'org.umi.block.checkExistFilePath':
        (async () => {
          try {
            const { path } = payload as AddBlockParams;
            log(`🔎 check exist file path ${chalk.yellow(path)}`);
            // 拼接真实的路径，应该是项目的 pages 目录下
            const absPath = api.winPath(join(api.paths.absPagesPath, path));
            success({
              exists: existsSync(absPath),
              success: true,
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

  function getRouteComponents(routes) {
    return routes.reduce((memo, route) => {
      if (route.component && !route.component.startsWith('()')) {
        const component = api.winPath(require.resolve(join(api.cwd, route.component)));
        if (!component.includes('src/layout')) {
          memo.push(component);
        }
      }
      if (route.routes) {
        memo = memo.concat(getRouteComponents(route.routes));
      }
      return memo;
    }, []);
  }

  api.modifyAFWebpackOpts(memo => {
    // TODO: 处理路由的热更新
    const routes = api.getRoutes();
    const routeComponents = getRouteComponents(routes);

    memo.extraBabelPlugins = [
      ...(memo.extraBabelPlugins || []),
      [
        require.resolve('../sdk/flagBabelPlugin'),
        {
          doTransform(filename) {
            return routeComponents.includes(api.winPath(filename));
          },
        },
      ],
    ];
    return memo;
  });

  if (process.env.NODE_ENV === 'development') {
    api.addEntryCode(`
(() => {
  // Runtime block add component
  window.GUmiUIFlag = require('${api.relativeToTmp(
    require.resolve('../sdk/flagBabelPlugin/GUmiUIFlag'),
  )}').default;

  // Enable/Disable block add edit mode
  const el = document.createElement('style');
  el.innerHTML = '.g_umiuiBlockAddEditMode { display: none; }';
  document.querySelector('head').appendChild(el);

  window.addEventListener('message', (event) => {
    try {
      const { action, data } = JSON.parse(event.data);
      switch (action) {
        case 'umi.ui.enableBlockEditMode':
          el.innerHTML = '';
          break;
        case 'umi.ui.disableBlockEditMode':
          el.innerHTML = '.g_umiuiBlockAddEditMode { display: none; }';
          break;
        case 'umi.ui.checkValidEditSection':
          const haveValid = !!document.querySelectorAll('div.g_umiuiBlockAddEditMode').length;
          const frame = document.getElementById('umi-ui-bubble');
          if (frame && frame.contentWindow) {
            frame.contentWindow.postMessage(
              JSON.stringify({
                action: 'umi.ui.checkValidEditSection.success',
                payload: {
                  haveValid,
                },
              }),
              '*',
            );
          }
        default:
          break;
      }
    } catch(e) {
      console.error(e);
    }
  }, false);

  // TODO: remove this before publish
  window.g_enableUmiUIBlockAddEditMode = function() {
    el.innerHTML = '';
  };
  window.g_disableUmiUIBlockAddEditMode = function() {
    el.innerHTML = '.g_umiuiBlockAddEditMode { display: none; }';
  };
})();
    `);
  }
};
