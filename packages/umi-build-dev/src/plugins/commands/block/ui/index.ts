import chalk from 'chalk';
import { existsSync } from 'fs';
import { IApi } from 'umi-types';
import { join } from 'path';
import { depthRouterConfig, routeExists } from '../util';
import { getFolderTreeData, fetchProBlockList } from './util';
import { Resource, AddBlockParams } from '../data.d';
import clearGitCache from '../clearGitCache';
import addBlock from '../addBlock';
import LogServe from './LogServer';

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
      getData: () => fetchProBlockList(),
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
      resourceType: 'custom',
      blockType: 'block',
      getData: () => {
        return Promise.resolve({
          success: true,
          data: [
            {
              name: 'Demo',
              url: 'https://github.com/umijs/umi-blocks/tree/master/demo',
              description: '示例区块',
              defaultPath: '/demo',
              tags: ['UmiJS Official'],
              img:
                'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjIwMHB4IiBoZWlnaHQ9IjIwMHB4IiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNDcuMSAoNDU0MjIpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPkdyb3VwIDI4IENvcHkgNTwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iNjIuMTAyMzI3MyUiIHkxPSIwJSIgeDI9IjEwOC4xOTcxOCUiIHkyPSIzNy44NjM1NzY0JSIgaWQ9ImxpbmVhckdyYWRpZW50LTEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjNDI4NUVCIiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMyRUM3RkYiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSI2OS42NDQxMTYlIiB5MT0iMCUiIHgyPSI1NC4wNDI4OTc1JSIgeTI9IjEwOC40NTY3MTQlIiBpZD0ibGluZWFyR3JhZGllbnQtMiI+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMyOUNERkYiIG9mZnNldD0iMCUiPjwvc3RvcD4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzE0OEVGRiIgb2Zmc2V0PSIzNy44NjAwNjg3JSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMEE2MEZGIiBvZmZzZXQ9IjEwMCUiPjwvc3RvcD4KICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iNjkuNjkwODE2NSUiIHkxPSItMTIuOTc0MzU4NyUiIHgyPSIxNi43MjI4OTgxJSIgeTI9IjExNy4zOTEyNDglIiBpZD0ibGluZWFyR3JhZGllbnQtMyI+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGQTgxNkUiIG9mZnNldD0iMCUiPjwvc3RvcD4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0Y3NEE1QyIgb2Zmc2V0PSI0MS40NzI2MDYlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGNTFEMkMiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSI2OC4xMjc5ODcyJSIgeTE9Ii0zNS42OTA1NzM3JSIgeDI9IjMwLjQ0MDA5MTQlIiB5Mj0iMTE0Ljk0MjY3OSUiIGlkPSJsaW5lYXJHcmFkaWVudC00Ij4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0ZBOEU3RCIgb2Zmc2V0PSIwJSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRjc0QTVDIiBvZmZzZXQ9IjUxLjI2MzUxOTElIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGNTFEMkMiIG9mZnNldD0iMTAwJSI+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0iUGFnZS0xIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0ibG9nbyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIwLjAwMDAwMCwgLTIwLjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iR3JvdXAtMjgtQ29weS01IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMC4wMDAwMDAsIDIwLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9Ikdyb3VwLTI3LUNvcHktMyI+CiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9Ikdyb3VwLTI1IiBmaWxsLXJ1bGU9Im5vbnplcm8iPgogICAgICAgICAgICAgICAgICAgICAgICA8ZyBpZD0iMiI+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNOTEuNTg4MDg2Myw0LjE3NjUyODIzIEw0LjE3OTk2NTQ0LDkxLjUxMjc3MjggQy0wLjUxOTI0MDYwNSw5Ni4yMDgxMTQ2IC0wLjUxOTI0MDYwNSwxMDMuNzkxODg1IDQuMTc5OTY1NDQsMTA4LjQ4NzIyNyBMOTEuNTg4MDg2MywxOTUuODIzNDcyIEM5Ni4yODcyOTIzLDIwMC41MTg4MTQgMTAzLjg3NzMwNCwyMDAuNTE4ODE0IDEwOC41NzY1MSwxOTUuODIzNDcyIEwxNDUuMjI1NDg3LDE1OS4yMDQ2MzIgQzE0OS40MzM5NjksMTU0Ljk5OTYxMSAxNDkuNDMzOTY5LDE0OC4xODE5MjQgMTQ1LjIyNTQ4NywxNDMuOTc2OTAzIEMxNDEuMDE3MDA1LDEzOS43NzE4ODEgMTM0LjE5MzcwNywxMzkuNzcxODgxIDEyOS45ODUyMjUsMTQzLjk3NjkwMyBMMTAyLjIwMTkzLDE3MS43MzczNTIgQzEwMS4wMzIzMDUsMTcyLjkwNjAxNSA5OS4yNTcxNjA5LDE3Mi45MDYwMTUgOTguMDg3NTM1OSwxNzEuNzM3MzUyIEwyOC4yODU5MDgsMTAxLjk5MzEyMiBDMjcuMTE2MjgzMSwxMDAuODI0NDU5IDI3LjExNjI4MzEsOTkuMDUwNzc1IDI4LjI4NTkwOCw5Ny44ODIxMTE4IEw5OC4wODc1MzU5LDI4LjEzNzg4MjMgQzk5LjI1NzE2MDksMjYuOTY5MjE5MSAxMDEuMDMyMzA1LDI2Ljk2OTIxOTEgMTAyLjIwMTkzLDI4LjEzNzg4MjMgTDEyOS45ODUyMjUsNTUuODk4MzMxNCBDMTM0LjE5MzcwNyw2MC4xMDMzNTI4IDE0MS4wMTcwMDUsNjAuMTAzMzUyOCAxNDUuMjI1NDg3LDU1Ljg5ODMzMTQgQzE0OS40MzM5NjksNTEuNjkzMzEgMTQ5LjQzMzk2OSw0NC44NzU2MjMyIDE0NS4yMjU0ODcsNDAuNjcwNjAxOCBMMTA4LjU4MDU1LDQuMDU1NzQ1OTIgQzEwMy44NjIwNDksLTAuNTM3OTg2ODQ2IDk2LjI2OTI2MTgsLTAuNTAwNzk3OTA2IDkxLjU4ODA4NjMsNC4xNzY1MjgyMyBaIiBpZD0iU2hhcGUiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMSkiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik05MS41ODgwODYzLDQuMTc2NTI4MjMgTDQuMTc5OTY1NDQsOTEuNTEyNzcyOCBDLTAuNTE5MjQwNjA1LDk2LjIwODExNDYgLTAuNTE5MjQwNjA1LDEwMy43OTE4ODUgNC4xNzk5NjU0NCwxMDguNDg3MjI3IEw5MS41ODgwODYzLDE5NS44MjM0NzIgQzk2LjI4NzI5MjMsMjAwLjUxODgxNCAxMDMuODc3MzA0LDIwMC41MTg4MTQgMTA4LjU3NjUxLDE5NS44MjM0NzIgTDE0NS4yMjU0ODcsMTU5LjIwNDYzMiBDMTQ5LjQzMzk2OSwxNTQuOTk5NjExIDE0OS40MzM5NjksMTQ4LjE4MTkyNCAxNDUuMjI1NDg3LDE0My45NzY5MDMgQzE0MS4wMTcwMDUsMTM5Ljc3MTg4MSAxMzQuMTkzNzA3LDEzOS43NzE4ODEgMTI5Ljk4NTIyNSwxNDMuOTc2OTAzIEwxMDIuMjAxOTMsMTcxLjczNzM1MiBDMTAxLjAzMjMwNSwxNzIuOTA2MDE1IDk5LjI1NzE2MDksMTcyLjkwNjAxNSA5OC4wODc1MzU5LDE3MS43MzczNTIgTDI4LjI4NTkwOCwxMDEuOTkzMTIyIEMyNy4xMTYyODMxLDEwMC44MjQ0NTkgMjcuMTE2MjgzMSw5OS4wNTA3NzUgMjguMjg1OTA4LDk3Ljg4MjExMTggTDk4LjA4NzUzNTksMjguMTM3ODgyMyBDMTAwLjk5OTg2NCwyNS42MjcxODM2IDEwNS43NTE2NDIsMjAuNTQxODI0IDExMi43Mjk2NTIsMTkuMzUyNDQ4NyBDMTE3LjkxNTU4NSwxOC40Njg1MjYxIDEyMy41ODUyMTksMjAuNDE0MDIzOSAxMjkuNzM4NTU0LDI1LjE4ODk0MjQgQzEyNS42MjQ2NjMsMjEuMDc4NDI5MiAxMTguNTcxOTk1LDE0LjAzNDAzMDQgMTA4LjU4MDU1LDQuMDU1NzQ1OTIgQzEwMy44NjIwNDksLTAuNTM3OTg2ODQ2IDk2LjI2OTI2MTgsLTAuNTAwNzk3OTA2IDkxLjU4ODA4NjMsNC4xNzY1MjgyMyBaIiBpZD0iU2hhcGUiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMikiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTUzLjY4NTYzMywxMzUuODU0NTc5IEMxNTcuODk0MTE1LDE0MC4wNTk2IDE2NC43MTc0MTIsMTQwLjA1OTYgMTY4LjkyNTg5NCwxMzUuODU0NTc5IEwxOTUuOTU5OTc3LDEwOC44NDI3MjYgQzIwMC42NTkxODMsMTA0LjE0NzM4NCAyMDAuNjU5MTgzLDk2LjU2MzYxMzMgMTk1Ljk2MDUyNyw5MS44Njg4MTk0IEwxNjguNjkwNzc3LDY0LjcxODExNTkgQzE2NC40NzIzMzIsNjAuNTE4MDg1OCAxNTcuNjQ2ODY4LDYwLjUyNDE0MjUgMTUzLjQzNTg5NSw2NC43MzE2NTI2IEMxNDkuMjI3NDEzLDY4LjkzNjY3NCAxNDkuMjI3NDEzLDc1Ljc1NDM2MDcgMTUzLjQzNTg5NSw3OS45NTkzODIxIEwxNzEuODU0MDM1LDk4LjM2MjM3NjUgQzE3My4wMjM2Niw5OS41MzEwMzk2IDE3My4wMjM2NiwxMDEuMzA0NzI0IDE3MS44NTQwMzUsMTAyLjQ3MzM4NyBMMTUzLjY4NTYzMywxMjAuNjI2ODQ5IEMxNDkuNDc3MTUsMTI0LjgzMTg3IDE0OS40NzcxNSwxMzEuNjQ5NTU3IDE1My42ODU2MzMsMTM1Ljg1NDU3OSBaIiBpZD0iU2hhcGUiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMykiPjwvcGF0aD4KICAgICAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICAgICAgPGVsbGlwc2UgaWQ9IkNvbWJpbmVkLVNoYXBlIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LTQpIiBjeD0iMTAwLjUxOTMzOSIgY3k9IjEwMC40MzY2ODEiIHJ4PSIyMy42MDAxOTI2IiByeT0iMjMuNTgwNzg2Ij48L2VsbGlwc2U+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==',
            },
          ],
        });
      },
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
        default:
          break;
      }
    } catch(e) {}
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
