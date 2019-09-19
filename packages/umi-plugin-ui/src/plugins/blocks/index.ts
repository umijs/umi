import chalk from 'chalk';
import { IApi } from 'umi-types';
import { Resource, Block, AddBlockParams } from 'data.d';
// import getRouteManager from '../../../getRouteManager';

export function routeExists(path, routes) {
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

export default function(api: IApi) {
  const log = api.log.log;

  function getRoutes() {
    return [];
    // const RoutesManager = getRouteManager(api.service);
    // RoutesManager.fetchRoutes();
    // return RoutesManager.routes;
  }

  function getBlocks(): Block[] {
    // TODO: read from server
    return [
      'AccountSettings',
      'DashboardAnalysis',
      'DashboardMonitor',
      'DashboardWorkplace',
      'EditorFlow',
      'EditorKoni',
      'EditorMind',
      'Exception403',
      'Exception404',
      'Exception500',
      'FormAdvancedForm',
      'FormBasicForm',
      'FormStepForm',
      'ListBasicList',
      'ListCardList',
      'ListSearch',
      'ListSearchApplications',
      'ListSearchArticles',
      'ListSearchProjects',
      'ListTableList',
      'ProfileAdvanced',
      'ProfileBasic',
      'ResultFail',
      'ResultSuccess',
      'UserLogin',
      'UserRegister',
      'UserRegisterResult',
    ].map(name => {
      return {
        name: name,
        description: name,
        url: `https://github.com/ant-design/pro-blocks/tree/master/${name}`,
        isPage: true,
        defaultPath: `/${name}`,
        img: `https://github.com/ant-design/pro-blocks/raw/master/${name}/snapshot.png`,
        tags: [],
      };
    });
  }

  api.addUIPlugin(require.resolve('../../../src/plugins/blocks/dist/ui.umd'));

  const reources: Resource[] = [
    {
      // TODO 支持扩展或者自定义
      id: 'ant-design-pro',
      name: 'Ant Design Pro',
      resourceType: 'github',
      blockType: 'template',
      url: 'https://github.com/ant-design/pro-blocks',
    },
  ];

  api.onUISocket(({ action, failure, success }) => {
    const { type, payload, lang } = action;
    switch (type) {
      case 'org.umi.block.routes':
        success({
          data: [],
        });
      case 'org.umi.block.resource':
        success({
          data: reources,
        });
        break;
      case 'org.umi.block.list':
        success({
          data: getBlocks(),
        });
        break;
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
            success();
            log(chalk.green('Add success'));
          } catch (e) {
            log(chalk.red('Add failed'));
          }
        })();
        break;
      case 'org.umi.block.checkexist':
        const { path } = payload;
        const routes = getRoutes();
        success({
          exists: routeExists(path, routes),
        });
        break;
      default:
        break;
    }
  });
}
