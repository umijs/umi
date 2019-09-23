import chalk from 'chalk';
import { IApi } from 'umi-types';
import { join } from 'path';
import { getBlockListFromGit } from '../util';
import { genRouterToTreeData } from './util';
import { Resource, Block, AddBlockParams } from '../data.d';
import clearGitCache from '../clearGitCache';
import addBlock from '../addBlock';
// import getRouteManager from '../../../getRouteManager';

export interface IApiBlock extends IApi {
  uiLog: (logType: 'error' | 'info', info: string) => void;
}

export function routeExists(path, routes) {
  // eslint-disable-next-line no-restricted-syntax
  for (const route of routes) {
    if (route.routes && routeExists(path, route.routes)) {
      return true;
    }
    if (path === route.path) {
      return true;
    }
  }
  return false;
}

const getBlocks = async (api: IApiBlock): Promise<Block[]> => {
  const blocks = await getBlockListFromGit('https://github.com/ant-design/pro-blocks', api);
  return blocks;
};

export default (api: IApiBlock) => {
  const { log } = api.log;
  function getRoutes() {
    return [];
    // const RoutesManager = getRouteManager(api.service);
    // RoutesManager.fetchRoutes();
    // return RoutesManager.routes;
  }

  api.addUIPlugin(require.resolve('../../../../../src/plugins/commands/block/ui/dist/ui.umd.js'));

  const reources: Resource[] = [
    {
      id: 'ant-design-pro',
      name: 'Ant Design Pro',
      resourceType: 'github',
      blockType: 'template',
      url: 'https://github.com/ant-design/pro-blocks',
    },
    {
      id: 'umijs-template',
      name: 'UmiJS Official',
      resourceType: 'github',
      blockType: 'template',
      url: 'https://github.com/umijs/umi-blocks',
    },
    {
      id: 'umijs-block',
      name: 'UmiJS Official',
      resourceType: 'github',
      blockType: 'block',
      url: 'https://github.com/umijs/umi-blocks',
    },
  ];

  api.onUISocket(({ action, failure, success, send, ...rest }) => {
    const routes = getRoutes();
    const { type, payload = {} } = action;

    /**
     * 初始化一些特殊的 function
     * 这个 方法可以快速的 log，并且带有 block 的前缀
     * @param logType
     * @param info
     */
    const uiLog = (logType: 'error' | 'info', info: string) =>
      rest.log(logType, `${chalk.hex('#40a9ff')('block:')} ${info}`);

    api.uiLog = uiLog;

    switch (type) {
      // 区块获得项目的路由
      case 'org.umi.block.routes':
        log(`🕵️‍ get routes from ${chalk.yellow(api.cwd)}`);
        uiLog('info', `🕵️‍ get routes from ${chalk.yellow(api.cwd)}`);

        success({
          data: genRouterToTreeData(api.config.routes),
        });
        break;

      // 清空缓存
      case 'org.umi.block.clear':
        log('block: clear cache');
        clearGitCache(payload, api);
        success({
          message: 'clear success',
          success: true,
        });
        break;

      // 区块获得数据源
      case 'org.umi.block.resource':
        success({
          data: reources,
          success: true,
        });
        break;

      // 获取区块列表
      case 'org.umi.block.list':
        getBlocks(api).then(blocks =>
          success({
            data: blocks,
            success: true,
          }),
        );
        break;

      // 区块添加
      case 'org.umi.block.add':
        (async () => {
          const { url, path } = payload as AddBlockParams;
          log(`Adding block ${chalk.magenta(url || path)} as ${path} ...`);
          try {
            await addBlock({ ...payload, url }, {}, api);
            success({
              data: true,
              success: true,
            });
            uiLog('info', '🎊 Adding block is success');
          } catch (error) {
            send({
              message: error.message,
              success: false,
            } as any);
            uiLog('error', error.message);
            log('Adding block is fail');
            console.log(error);
          }
        })();
        break;
      // 检查路由是否存在
      case 'org.umi.block.checkexist':
        success({
          exists: routeExists((payload as AddBlockParams).path, routes),
        });
        break;
      default:
        break;
    }
  });

  function getRouteComponents(routes) {
    return routes.reduce((memo, route) => {
      if (route.component && !route.component.startsWith('()')) {
        memo.push(api.winPath(join(api.cwd, route.component)));
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
        require.resolve('./flagBabelPlugin'),
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
  window.GUmiUIFlag = require('${require.resolve('./flagBabelPlugin/GUmiUIFlag')}').default;

  // Enable/Disable block add edit mode
  const el = document.createElement('style');
  el.innerHTML = '.g_umiuiBlockAddEditMode { display: none; }';
  document.querySelector('head').appendChild(el);

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
