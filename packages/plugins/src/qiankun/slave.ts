import {
  NextFunction,
  Request,
  Response,
} from '@umijs/bundler-utils/compiled/express';
import {
  createProxyMiddleware,
  Options,
  // @ts-ignore 现在打包好的 http-proxy-middleware 有导出 responseInterceptor，但没有导出声明
  responseInterceptor,
} from '@umijs/bundler-utils/compiled/http-proxy-middleware';
import { cheerio } from '@umijs/utils';
import assert from 'assert';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi, RUNTIME_TYPE_FILE_NAME } from 'umi';
import { winPath } from 'umi/plugin-utils';
import { withTmpPath } from '../utils/withTmpPath';
import { qiankunStateFromMasterModelNamespace } from './constants';

type SlaveOptions = any;

function getCurrentLocalDevServerEntry(api: IApi, req: Request): string {
  const port = api.appData.port;
  const hostname = req.hostname;
  const protocol = req.protocol;
  return `${protocol}://${hostname}${port ? ':' : ''}${port}/local-dev-server`;
}

// 用于处理本地研发时拿到的 entry html，只会在本地 dev 时消费
function handleOriginalHtml(
  api: IApi,
  microAppEntry: string,
  originalHtml: string,
) {
  const appName = api.config.qiankun?.slave?.appName || api.pkg.name;
  assert(
    appName,
    '[@umijs/plugin-qiankun]: You should have name in package.json',
  );
  const $ = cheerio.load(originalHtml);

  // 插入 extra-qiankun-config
  // 本地研发时设置 __QIANKUN_DEVELOPMENT__ 为 true，避免遇到热更新 bug
  $('head').prepend(
    `<script>window.__QIANKUN_DEVELOPMENT__=true</script>
    <script type="extra-qiankun-config">${JSON.stringify({
      master: {
        apps: [
          {
            name: appName,
            entry: microAppEntry,
            extraSource: microAppEntry,
          },
        ],
        routes: [
          {
            microApp: appName,
            name: appName,
            path: '/' + appName,
            extraSource: microAppEntry,
          },
        ],
        prefetch: false,
      },
    })}</script>`,
  );

  return api.applyPlugins({
    key: 'modifyMasterHTML',
    type: api.ApplyPluginsType.modify,
    initialValue: $.html(),
  });
}

// BREAK CHANGE: 需要手动配置 slave: {}，不能留空
function isSlaveEnable(opts: { userConfig: any }) {
  const slaveCfg = opts.userConfig?.qiankun?.slave;
  if (slaveCfg) {
    return slaveCfg.enable !== false;
  }
  return !!process.env.INITIAL_QIANKUN_SLAVE_OPTIONS;
}

export default (api: IApi) => {
  api.describe({
    key: 'qiankun-slave',
    enableBy: isSlaveEnable,
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'slaveRuntimePlugin.ts' })];
  });

  api.register({
    key: 'addExtraModels',
    fn() {
      return [
        withTmpPath({
          api,
          path: `qiankunModel.ts#{"namespace":"${qiankunStateFromMasterModelNamespace}"}`,
        }),
      ];
    },
  });
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
interface LifeCycles {
    bootstrap?: (props?: any) => Promise<any>;
    mount?: (props?: any) => Promise<any>;
    unmount?: (props?: any) => Promise<any>;
    update?: (props?: any) => Promise<any>;
}
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (Without<T, U> & U) | (Without<U, T> & T);
interface SlaveOption extends LifeCycles {
    enable?: boolean;
}
interface Config {
    slave?: SlaveOption;
}
export interface IRuntimeConfig {
    qiankun?: XOR<Config, LifeCycles>
}
      `,
    });
  });
  api.modifyDefaultConfig((memo) => {
    const initialSlaveOptions: SlaveOptions = {
      devSourceMap: true,
      ...JSON.parse(process.env.INITIAL_QIANKUN_SLAVE_OPTIONS || '{}'),
      ...(memo.qiankun || {}).slave,
    };
    const modifiedDefaultConfig = {
      ...memo,
      // 默认开启 runtimePublicPath，避免出现 dynamic import 场景子应用资源地址出问题
      runtimePublicPath: true,
      qiankun: {
        ...memo.qiankun,
        slave: initialSlaveOptions,
      },
    } as any;

    const shouldNotModifyDefaultBase =
      api.userConfig.qiankun?.slave?.shouldNotModifyDefaultBase ??
      initialSlaveOptions.shouldNotModifyDefaultBase;
    const historyType = api.userConfig.history?.type || 'browser';
    if (!shouldNotModifyDefaultBase && historyType !== 'hash') {
      // @ts-ignore
      modifiedDefaultConfig.base = `/${api.pkg.name}`;
    }

    if (modifiedDefaultConfig.mfsu !== false) {
      modifiedDefaultConfig.mfsu = {
        ...modifiedDefaultConfig.mfsu,
        mfName:
          modifiedDefaultConfig.mfsu?.mfName ||
          `mf_${api.pkg.name
            // 替换掉包名里的特殊字符
            // e.g. @umi/ui -> umi_ui
            ?.replace(/^@/, '')
            .replace(/\W/g, '_')}`,
      };
    }

    return modifiedDefaultConfig;
  });

  api.addHTMLHeadScripts(() => {
    const dontModify =
      api.config.qiankun?.slave?.shouldNotModifyRuntimePublicPath;
    return dontModify
      ? []
      : [
          `window.publicPath = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || "${
            api.config.publicPath || '/'
          }";`,
        ];
  });

  api.chainWebpack((config) => {
    assert(api.pkg.name, 'You should have name in package.json.');
    // 默认不修改 library chunk 的 name，从而确保可以通过 window[appName] 访问到导出
    // mfsu 关闭的时候才可以修改，否则可能导致配合 mfsu 时，子应用的 umd chunk 无法被正确加载
    // mfsu 线上不会开启，所以这里只需要判断本地是否开启即可
    const {
      shouldNotAddLibraryChunkName = api.env === 'production' ||
        !Boolean(api.config.mfsu),
    } = (api.config.qiankun || {}).slave!;
    config.output
      .libraryTarget('umd')
      .library(
        shouldNotAddLibraryChunkName ? api.pkg.name : `${api.pkg.name}-[name]`,
      );
    // TODO: SOCKET_SERVER
    // TODO: devSourceMap
    return config;
  });

  // umi bundle 添加 entry 标记
  api.modifyHTML(($) => {
    $('script').each((_: any, el: any) => {
      const scriptEl = $(el);
      const umiEntry = /\/?umi(\.\w+)?\.js$/g;
      if (umiEntry.test(scriptEl.attr('src') ?? '')) {
        scriptEl.attr('entry', '');
      }
    });
    return $;
  });

  api.addEntryImports(() => {
    return [
      {
        source: '@@/plugin-qiankun-slave/lifecycles',
        specifier:
          '{ genMount as qiankun_genMount, genBootstrap as qiankun_genBootstrap, genUnmount as qiankun_genUnmount, genUpdate as qiankun_genUpdate }',
      },
    ];
  });

  api.addEntryCode(() => [
    `
export const bootstrap = qiankun_genBootstrap(render);
export const mount = qiankun_genMount('${api.config.mountElementId}');
export const unmount = qiankun_genUnmount('${api.config.mountElementId}');
export const update = qiankun_genUpdate();
if (!window.__POWERED_BY_QIANKUN__) {
  bootstrap().then(mount);
}
    `,
  ]);

  function getFileContent(file: string) {
    return readFileSync(
      join(__dirname, '../../libs/qiankun/slave', file),
      'utf-8',
    );
  }

  api.onGenerateFiles({
    fn() {
      //     api.writeTmpFile({
      //       path: 'slaveOptions.ts',
      //       content: `
      // let options = ${JSON.stringify((api.config.qiankun || {}).slave || {})};
      // export const getSlaveOptions = () => options;
      // export const setSlaveOptions = (newOpts) => options = ({ ...options, ...newOpts });
      //       `,
      //     });

      [
        'constants.ts',
        'qiankunModel.ts',
        'connectMaster.tsx',
        'MicroAppLink.tsx',
        'slaveRuntimePlugin.ts',
        'lifecycles.ts',
      ].forEach((file) => {
        api.writeTmpFile({
          path: file.replace(/\.tpl$/, ''),
          content: getFileContent(file)
            .replace(
              '__USE_MODEL__',
              api.isPluginEnable('model')
                ? `import { useModel } from '@@/plugin-model'`
                : `const useModel = null;`,
            )
            .replace(
              /from 'qiankun'/g,
              `from '${winPath(dirname(require.resolve('qiankun/package')))}'`,
            )
            .replace(
              /from 'lodash\//g,
              `from '${winPath(dirname(require.resolve('lodash/package')))}/`,
            ),
        });
      });

      api.writeTmpFile({
        path: 'index.ts',
        content: `
export { connectMaster } from './connectMaster';
export { MicroAppLink } from './MicroAppLink';
      `,
      });
    },
    before: 'model',
  });

  api.addMiddlewares(async () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const qiankunConfig = api.config.qiankun || {};
      const masterEntry = qiankunConfig.slave?.masterEntry;

      const { proxyToMasterEnabled } = ((await api.applyPlugins({
        key: 'shouldProxyToMaster',
        type: api.ApplyPluginsType.modify,
        initialValue: { proxyToMasterEnabled: true, req },
      })) ?? {}) as {
        req?: Request;
        proxyToMasterEnabled?: boolean;
      };

      if (masterEntry && proxyToMasterEnabled) {
        await api.applyPlugins({
          key: 'onLocalProxyStart',
          type: api.ApplyPluginsType.event,
        });

        // 新增一个 modifyLocalProxyOpts 事件，支持用户自定义本地 proxy 代理参数
        const modifyLocalProxyOpts = ((await api.applyPlugins({
          key: 'modifyLocalProxyOpts',
          type: api.ApplyPluginsType.modify,
          initialValue: {},
        })) ?? {}) as Partial<Options>;

        const localProxyOpts: Partial<Options> = {
          target: masterEntry,
          secure: false,
          ignorePath: false,
          followRedirects: false,
          changeOrigin: true,
          selfHandleResponse: true,
          ...modifyLocalProxyOpts,
        };

        return createProxyMiddleware(
          (pathname) => pathname !== '/local-dev-server',
          {
            ...localProxyOpts,
            onProxyReq(proxyReq) {
              api.applyPlugins({
                key: 'onLocalProxyReq',
                type: api.ApplyPluginsType.event,
                sync: true,
                args: proxyReq,
              });
            },
            onProxyRes: responseInterceptor(
              async (
                responseBuffer: any,
                proxyRes: any,
                req: any,
                res: any,
              ) => {
                if (proxyRes.statusCode === 302) {
                  const { ignorePath = false } = localProxyOpts;
                  // 应该使用原始请求的 goto 链接，而非 masterEntry
                  const { hostname, url, protocol } = req as Request;
                  const port = process.env.PORT || api.appData?.port;
                  // 如果代理时忽略了 path，则需要把原始请求的 path 拼接到 gotoBasePart 上
                  const gotoBasePart = `${protocol}://${hostname}:${port}${
                    ignorePath && url ? url : '/'
                  }`;
                  const fromBasePart = masterEntry;
                  const locationUrl = proxyRes.headers.location || '';
                  // 只替换 search 参数的部分
                  const [originAndPath, searchParams] = locationUrl.split('?');
                  // 替换时只用替换 url base part 部分
                  const searchHandled = searchParams
                    ? `?${searchParams.replace(
                        encodeURIComponent(fromBasePart),
                        encodeURIComponent(gotoBasePart),
                      )}`
                    : '';
                  const redirectUrl = `${originAndPath}${searchHandled}`;
                  const redirectMessage = `[@umijs/plugin-qiankun]: redirect to ${redirectUrl}`;

                  api.logger.info(redirectMessage);
                  res.statusCode = 302;
                  res.setHeader('location', redirectUrl);
                  return redirectMessage;
                }

                const microAppEntry = getCurrentLocalDevServerEntry(api, req);
                const originalHtml = responseBuffer.toString('utf8');
                const html = handleOriginalHtml(
                  api,
                  microAppEntry,
                  originalHtml,
                );

                return html;
              },
            ),
            onError(err, _, res) {
              api.logger.error(err);
              res.set('content-type', 'text/plain; charset=UTF-8');
              res.end(
                `[@umijs/plugin-qiankun] 代理到 ${masterEntry} 时出错了，请尝试 ${masterEntry} 是否是可以正常访问的，然后重新启动项目试试。(注意如果出现跨域问题，请修改本地 host ，通过一个和主应用相同的一级域名的域名来访问 127.0.0.1)`,
              );
            },
          },
        )(req, res, next);
      }

      return next();
    };
  });
};
