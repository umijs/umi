import type { IApi } from '../../types';
import { isWindows } from '../../utils/platform';

import { winPath } from '@umijs/utils';
import { dirname } from 'path';
import { resolveProjectDep } from '../../utils/resolveProjectDep';

// 解析react-helmet-async 在renderer-react中的路径
let corePath: string | undefined;
const REACT_HELMET_ASYNC = 'react-helmet-async';
const RENDERER_REACT = '@umijs/renderer-react';
let pkgPath: string;
const getReactHelmetAsyncPath = (api: IApi) => {
  if (corePath) {
    return corePath;
  }
  const defaultPkgPath = winPath(
    dirname(require.resolve(`${RENDERER_REACT}/package.json`)),
  );
  // 解析 renderer-react 包的路径
  try {
    const rendererReactPath = resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: RENDERER_REACT,
    });
    pkgPath = rendererReactPath ? winPath(rendererReactPath) : defaultPkgPath;
  } catch (e: any) {
    throw new Error(
      `[reactQuery] package '${RENDERER_REACT}' resolve failed, ${e.message}`,
    );
  }
  // 基于 renderer-react 的路径找到 react-helmet-async
  try {
    corePath = winPath(
      dirname(
        require.resolve(`${REACT_HELMET_ASYNC}/package.json`, {
          paths: [pkgPath],
        }),
      ),
    );
    console.log(corePath);
  } catch {}
  return corePath;
};

export default (api: IApi) => {
  api.describe({
    key: 'vite',
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyAppData((memo) => {
    memo.bundler = 'vite';
    return memo;
  });

  api.modifyConfig((memo) => {
    // like vite, use to pre-bundling dependencies in vite mode
    if (isWindows) {
      const corePath = getReactHelmetAsyncPath(api);
      memo.alias[REACT_HELMET_ASYNC] = corePath;
    }
    memo.alias['@fs'] = api.cwd;
    return memo;
  });

  api.modifyDefaultConfig((memo) => {
    // vite development env disable polyfill optimise dev development experience
    if (api.env === 'development') {
      memo.polyfill = false;
    }
    return memo;
  });

  // scan deps into api.appData by default for vite mode
  api.register({
    key: 'onBeforeCompiler',
    stage: Number.POSITIVE_INFINITY,
    async fn() {
      await api.applyPlugins({
        key: 'updateAppDataDeps',
        type: api.ApplyPluginsType.event,
      });
    },
  });

  // include extra monorepo package deps for vite pre-bundle
  api.modifyViteConfig((memo) => {
    memo.optimizeDeps = {
      ...(memo.optimizeDeps || {}),
      include: memo.optimizeDeps?.include?.concat(
        Object.values(api.appData.deps!)
          .map(({ matches }) => matches[0])
          .filter(
            (item) =>
              item?.startsWith('@fs') && !item?.includes('node_modules'),
          ),
      ),
    };

    return memo;
  });

  // add script modules and links to vite output htmldocument,to meet targets whether or not support ESM
  let buildStats: any;
  api.onBuildComplete(({ err, stats }) => {
    if (!err) {
      buildStats = stats;
    }
  });
  api.modifyHTML(($) => {
    if (buildStats) {
      $('head').append(buildStats.extraHtml.head);
      $('body').append(buildStats.extraHtml.body);
    }
    return $;
  });
};
