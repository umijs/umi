import { IApi, IWebpackChainConfig } from 'umi-types';
import { IOpts } from './types';
import { getExternalData, onlineCheck } from './util';

export default function(
  api: IApi,
  {
    packages = [],
    urlTemplate = 'https://unpkg.com/{{ library }}@{{ version }}/{{ path }}',
    checkOnline = false,
  }: IOpts,
) {
  api.onOptionChange(() => {
    api.restart('auto external config changes');
  });

  const { debug } = api;
  const configs = getExternalData({ api, packages, urlTemplate });

  debug('User external data:');
  debug(configs);

  if (!configs.length) {
    return;
  }

  if (checkOnline) {
    api.onStartAsync(async () => {
      await onlineCheck(configs);
    });
  }

  // 修改 webpack external 配置
  api.chainWebpackConfig((webpackConfig: IWebpackChainConfig) => {
    webpackConfig.externals(getWebpackExternalConfig(configs));
  });

  // 修改 script 标签
  const scripts = configs.reduce(
    (accumulator, current) => accumulator.concat(current.scripts),
    [],
  );
  api.addHTMLHeadScript(() => scripts.map(src => ({ src, crossorigin: true })));

  // 添加 style
  const styles = configs.reduce(
    (accumulator, current) => accumulator.concat(current.styles),
    [],
  );
  api.addHTMLLink(() =>
    styles.map(href => ({
      charset: 'utf-8',
      rel: 'stylesheet',
      type: 'text/css',
      href,
    })),
  );

  // TODO: 传递 exclude
}

function getWebpackExternalConfig(configs) {
  const res = [];
  const objectConfig = {};
  configs.forEach(({ key, global: root }) => {
    if (typeof root === 'string') {
      objectConfig[key] = root;
    } else {
      res.push(root);
    }
  });
  res.unshift(objectConfig);
  return res;
}
