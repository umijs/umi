import { Bundler } from '@umijs/bundler-webpack';
import * as defaultWebpack from '@umijs/deps/compiled/webpack';
import WebpackBarPlugin from '@umijs/deps/compiled/webpackbar';
import { existsSync } from 'fs';
import { mkdir, readdir, unlink, writeFile } from 'fs/promises';
import { cloneDeep } from 'lodash';
import { join } from 'path';
import { IApi } from 'umi';
import webpack from 'webpack';
import { getMfsuTmpPath } from '.';
import { getBundleAndConfigs } from '../../commands/buildDevUtils';

const resolveDep = (dep: string) => dep.replace(/\//g, '_');

export type Deps = {
  [pkg: string]: string;
};

export const prefix = '__umi_mfsu_';

export const preBuild = async (api: IApi, deps: Deps) => {
  const tmpDir = getMfsuTmpPath(api);

  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir);
  }

  // 清除原先的目录
  (await readdir(tmpDir)).forEach(async (dir) => {
    await unlink(join(tmpDir, dir));
  });

  const bundler = new Bundler({ cwd: process.cwd(), config: {} });
  const { bundleConfigs } = await getBundleAndConfigs({ api }); // 获取原本的配置

  const mfConfig: defaultWebpack.Configuration = cloneDeep(bundleConfigs[0]);

  if (!mfConfig) {
    throw new Error('找不到 Webpack 配置');
  }

  const exposes = {};
  Object.keys(deps).forEach((dep) => {
    exposes[`./${dep}`] = join(tmpDir, resolveDep(prefix + dep + '.js'));
  });

  // 构建虚拟应用
  for (let dep of Object.keys(deps)) {
    await writeFile(
      join(tmpDir, resolveDep(prefix + dep + '.js')),
      ['antd'].includes(dep)
        ? `export * from "${dep}";`
        : `export * from "${dep}";import D from "${dep}";export default D;`,
      {
        flag: 'w+',
      },
    );
  }
  const entryFile = '"😛"';
  await writeFile(join(tmpDir, './index.js'), entryFile);

  if (mfConfig.plugins) {
    mfConfig.stats = 'none';
    // @ts-ignore
    mfConfig.entry = join(tmpDir, 'index.js');
    mfConfig.output!.path = tmpDir;
    mfConfig.output!.filename = prefix + 'index.js';
    mfConfig.output!.libraryTarget = 'commonjs';
    mfConfig.plugins.push(
      //@ts-ignore
      new webpack.container.ModuleFederationPlugin({
        name: 'mf',
        filename: prefix + 'remoteEntry.js',
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

    // 删除 DevCompileDonePlugin 和 WebpackBarPlugin
    mfConfig.plugins.forEach((plugin, index) => {
      if (
        ['DevCompileDonePlugin', 'WebpackBarPlugin'].includes(
          plugin.constructor.name,
        )
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
    // TODO: 对 webpack process bar 修改配置或者删除？区分普通的build
    const stat = await bundler.build({ bundleConfigs: [mfConfig] });

    // 构建这次打包的依赖表，用于 diff
    await writeFile(join(tmpDir, './info.json'), JSON.stringify(deps));
    // webpack({});
  }
};
