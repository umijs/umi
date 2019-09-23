import chalk from 'chalk';
import { IApi } from 'umi-types';
import { join } from 'path';
import { getBlockListFromGit } from '../util';
import { Resource, Block, AddBlockParams } from '../data.d';
// import getRouteManager from '../../../getRouteManager';

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

export default (api: IApi) => {
  const { log } = api.log;

  function getRoutes() {
    return [];
    // const RoutesManager = getRouteManager(api.service);
    // RoutesManager.fetchRoutes();
    // return RoutesManager.routes;
  }

  const getBlocks = async (): Promise<Block[]> => {
    return await getBlockListFromGit('https://github.com/ant-design/pro-blocks');
  };

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
      id: 'umijs',
      name: 'UmiJS Official',
      resourceType: 'github',
      blockType: 'template',
      url: 'https://github.com/umijs/umi-blocks',
    },
  ];

  api.onUISocket(({ action, failure, success }) => {
    const routes = getRoutes();
    const { type, payload = {}, lang } = action;
    switch (type) {
      // 区块获得项目的路由
      case 'org.umi.block.routes':
        success({
          data: [],
        });
        break;

      // 区块获得数据源
      case 'org.umi.block.resource':
        success({
          data: reources,
        });
        break;

      // 获取区块列表
      case 'org.umi.block.list':
        getBlocks().then(blocks =>
          success({
            data: blocks,
          }),
        );
        break;

      // 区块添加
      case 'org.umi.block.add':
        (async () => {
          const { url, path } = payload as AddBlockParams;

          log(`Adding block ${chalk.magenta(url)} as ${path} ...`);
          try {
            await api.service.runCommand(
              'block',
              {
                _: ['add', url, '--path', path],
              },
              message => {
                log(`${chalk.gray('[umi block add]')} ${message}`);
              },
            );
            success({ message: 'add block success' });
            log(chalk.green('Add success'));
          } catch (e) {
            log(chalk.red('Add failed'));
          }
        })();
        break;

      // 检查路由是否存在
      case 'org.umi.block.checkexist':
        const { path } = payload as AddBlockParams;
        success({
          exists: routeExists(path, routes),
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
