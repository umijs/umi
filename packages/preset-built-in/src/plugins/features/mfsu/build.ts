import { Bundler } from '@umijs/bundler-webpack';
// @ts-ignore
import { transform } from '@umijs/deps/compiled/babel/core';
import * as defaultWebpack from '@umijs/deps/compiled/webpack';
import WebpackBarPlugin from '@umijs/deps/compiled/webpackbar';
import { lodash, mkdirp, winPath } from '@umijs/utils';
import {
  existsSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { IApi } from 'umi';
import webpack from 'webpack';
import { getBundleAndConfigs } from '../../commands/buildDevUtils';
import ModifyRemoteEntryPlugin from './babel-modify-remote-entry-plugin';
import { getAlias, getMfsuPath, TMode } from './mfsu';
import ModifyChunkNamePlugin from './modifyChunkNamePlugin';
import { figureOutExport } from './utils';

const resolveDep = (dep: string) => dep.replace(/\//g, '_');

export type Deps = {
  [pkg: string]: string;
};

export const prefix = 'mf-va_';

interface IPreBuildOpts {
  deps: Deps;
  mode?: TMode;
  outputPath?: string;
}

export const preBuild = async (
  api: IApi,
  { deps = {}, mode = 'development', outputPath = '' }: IPreBuildOpts,
) => {
  const tmpDir = outputPath || getMfsuPath(api, { mode });

  if (!existsSync(tmpDir)) {
    await mkdirp(tmpDir);
  }

  // 清除原先的目录
  readdirSync(tmpDir).forEach((dir) => {
    // 不删除 diff 文件
    if (dir !== 'info.json') {
      unlinkSync(join(tmpDir, dir));
    }
  });

  const bundler = new Bundler({ cwd: api.cwd, config: {} });
  const { bundleConfigs } = await getBundleAndConfigs({ api }); // 获取原本的配置

  const mfConfig: defaultWebpack.Configuration = lodash.cloneDeep(
    bundleConfigs[0],
  );

  if (!mfConfig) {
    throw new Error('[MFSU] 预编译找不到 Webpack 配置');
  }

  const exposes = {};
  Object.keys(deps).forEach((dep) => {
    exposes[`./${dep}`] = join(tmpDir, resolveDep(prefix + dep + '.js'));
  });

  const alias = await getAlias(api, { reverse: true });

  // 构建虚拟应用
  for (let dep of Object.keys(deps)) {
    const requireFrom = alias[dep] ? winPath(alias[dep]) : dep;
    writeFileSync(
      join(tmpDir, resolveDep(prefix + dep + '.js')),
      [
        ['antd'].includes(dep) ? 'import "antd/dist/antd.less";' : '',
        await figureOutExport(api.cwd, requireFrom),
      ]
        .join('\n')
        .trim(),
    );
  }
  const entryFile = '"😛"';
  writeFileSync(join(tmpDir, './index.js'), entryFile);

  mfConfig.mode = mode;
  mfConfig.stats = 'none';
  mfConfig.entry = join(tmpDir, 'index.js');
  mfConfig.output!.path = tmpDir;
  mfConfig.output!.filename = prefix + 'index.js';
  mfConfig.output!.libraryTarget = 'commonjs';

  if (!mfConfig.plugins) {
    mfConfig.plugins = [];
  }
  // 修改 chunk 名
  mfConfig.plugins.push(new ModifyChunkNamePlugin());

  const remoteEntryFilename = prefix + 'remoteEntry.js';
  mfConfig.plugins.push(
    //@ts-ignore
    new webpack.container.ModuleFederationPlugin({
      name: 'mf',
      filename: remoteEntryFilename,
      exposes,
    }),
  );
  // 这个打包应该剔除 import-to-await-require 插件
  mfConfig.module!.rules.forEach((rule) => {
    // @ts-ignore
    rule?.use?.forEach((u) => {
      if (/babel-loader/.test(u.loader)) {
        // @ts-ignore
        u?.options?.plugins?.forEach((plugin, index) => {
          if (/import-to-await-require/.test(plugin[0])) {
            u?.options?.plugins.splice(index, 1);
          }
        });
      }
    });
  });

  // 删除部分不需要的插件
  mfConfig.plugins.forEach((plugin, index) => {
    if (
      [
        'DevCompileDonePlugin',
        'WebpackBarPlugin',
        'BundleAnalyzerPlugin',
        'HtmlWebpackPlugin',
      ].includes(plugin.constructor.name)
    ) {
      mfConfig.plugins!.splice(index, 1);
    }

    if (
      plugin.constructor.name === 'ModuleFederationPlugin' &&
      // @ts-ignore
      plugin._options.name === 'umi-app'
    ) {
      mfConfig.plugins!.splice(index, 1);
    }
  });

  // 重新构建一个 WebpackBarPlugin
  if (process.env.PROGRESS !== 'none') {
    mfConfig.plugins.push(
      new WebpackBarPlugin({
        name: 'mfsu',
      }),
    );
  }

  // 因为 webpack5 不会自动注入 node-libs-browser，因此手动操作一下
  // 包已经在 bundle-webpack/getConfig 中通过 fallback 注入，在此仅针对特殊包制定指向
  mfConfig.plugins.push(
    // @ts-ignore
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  );

  const stat = await bundler.build({ bundleConfigs: [mfConfig] });

  // 修改 remoteEntry.js，为拉取依赖添加 hash（缓存相关功能）
  const remoteEntryPath = join(tmpDir, remoteEntryFilename);
  const remoteEntryFileContent = readFileSync(remoteEntryPath, 'utf-8');

  const hash = Date.now()
    .toString()
    .split('')
    .reduce(function (a: number, b: string) {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

  writeFileSync(
    remoteEntryPath,
    transform(remoteEntryFileContent, {
      filename: remoteEntryFilename,
      plugins: [[ModifyRemoteEntryPlugin, { hash }]],
    })!.code!,
  );
  // 构建这次打包的依赖表，用于 diff
  writeFileSync(join(tmpDir, './info.json'), JSON.stringify(deps));
};
