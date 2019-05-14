import { IApi } from 'umi-types';
import { join, dirname } from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { existsSync } from 'fs';
import assert from 'assert';
import { IOpts } from './types';
import { getExternalData, onlineCheck } from './util';

const PATH_KEY = 'externals';

export default function(
  api: IApi,
  {
    packages = [],
    urlTemplate = `{{ publicPath }}${PATH_KEY}/{{ library }}@{{ version }}/{{ path }}`,
    checkOnline = false,
  }: IOpts,
) {
  const { debug, cwd, config } = api;
  const configs = getExternalData({
    pkg: require(join(cwd, 'package.json')),
    versionInfos: api.applyPlugins('addVersionInfo'),
    config,
    packages,
    urlTemplate,
    publicPath: config.publicPath || '/',
  });

  debug('User external data:');
  debug(JSON.stringify(configs));

  if (!configs.length) {
    return;
  }

  if (checkOnline) {
    api.onStartAsync(async () => {
      await onlineCheck(configs);
    });
  }

  // 修改 webpack external 配置
  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.externals(getWebpackExternalConfig(configs));
  });

  // 修改 script 标签
  const scripts = configs.reduce((accumulator, current) => accumulator.concat(current.scripts), []);
  api.addHTMLHeadScript(() => scripts.map(src => ({ src, crossorigin: true })));

  // 添加 style
  const styles = configs.reduce((accumulator, current) => accumulator.concat(current.styles), []);
  api.addHTMLLink(() => {
    return styles.map(href => ({
      rel: 'stylesheet',
      href,
    }));
  });

  // 如果 urlTemplate 不是 cdn，输出到 dist 目录下
  api.modifyWebpackConfig(webpackConfig => {
    const { cwd } = api;
    if (!/^https?:\/\//.test(urlTemplate)) {
      // TODO: 不和前面的 urlTemplate 有耦合
      assert(
        urlTemplate.includes('{{ library }}@{{ version }}'),
        `urlTemplate config should includes {{ library }}@{{ version }}`,
      );
      const copyConfig = scripts.concat(styles).map(path => {
        const [nameVersion, ...relPathArr] = path.split(`${PATH_KEY}/`)[1].split('/');
        const relPath = relPathArr.join('/');
        const [name] = nameVersion.split('@');
        return {
          from: getRealPath({
            name,
            relPath,
            alias: webpackConfig.resolve.alias,
            cwd,
          }),
          to: dirname(join(webpackConfig.output.path, path)),
        };
      });

      webpackConfig.plugins.push(new CopyWebpackPlugin(copyConfig));
    }
    return webpackConfig;
  });

  // TODO: 传递 exclude
}

function getRealPath({ name, relPath, alias, cwd }) {
  let realPath = null;
  if (alias[name]) {
    realPath = join(alias[name], relPath);
  } else {
    realPath = join(cwd, 'node_modules', name, relPath);
  }
  assert(existsSync(realPath), `Copy to output path failed: ${realPath} not exists`);
  return realPath;
}

function getWebpackExternalConfig(configs) {
  const res = [];
  const objectConfig = {};
  configs.forEach(({ key, global }) => {
    if (typeof global === 'string') {
      objectConfig[key] = global;
    } else {
      res.push(global);
    }
  });
  res.unshift(objectConfig);
  return res;
}
