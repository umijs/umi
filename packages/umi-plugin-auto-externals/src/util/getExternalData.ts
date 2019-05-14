import { IConfig, IPkg } from 'umi-types';
import * as semver from 'semver';
import autoExternalPackages from 'auto-external-packages';
import error from './error';
import sort from './sort';
import { IExternalData } from '../types';

const EXTERNAL_MAP = autoExternalPackages.reduce((pre, cur) => {
  pre[cur.key] = cur;
  return pre;
}, {});

interface IGetExternalDataParams {
  pkg: IPkg;
  versionInfos: string[];
  packages: string[] | Boolean;
  config: IConfig;
  urlTemplate?: string;
  publicPath?: string;
}

function packagesToArray(packages: string[] | Boolean): string[] {
  if (Array.isArray(packages)) {
    return packages;
  }
  return autoExternalPackages.map(({ key }) => key);
}

function configValidate({ config, packages }: IGetExternalDataParams) {
  // 格式校验
  if (!Array.isArray(packages) && typeof packages !== 'boolean') {
    error(`packages only support Array or Boolean!`);
  }

  const keys = packagesToArray(packages);

  keys.forEach((key: string, index: number) => {
    // 必须是内置的支持的仓库
    const configItem = EXTERNAL_MAP[key];
    if (!configItem) {
      error(`Not support auto external dependencies: ${key}`);
    }

    const { dependencies: keyDependencies } = configItem;
    if (!keyDependencies) {
      return;
    }
    keyDependencies.forEach(dep => {
      if (!keys.includes(dep)) {
        keys.push(dep);
      }
    });
  });

  const externalConfig = config.externals || {};
  keys.forEach((key: string) => {
    // 同一个包不能同时在 autoExternal 和 externals 中配置
    if (externalConfig[key]) {
      error(`${key} is is both in external and autoExternals`);
    }
  });
}

/**
 * 获取所有内置 library key 的版本号
 * @param api umi plugin api
 * @param keys 所有内置的 library keys
 */
function getAllKeyVersions(
  pkg: IPkg,
  versionInfos: string[],
  keys: string[],
): { [key: string]: string } {
  const res = {};

  // 获取 umi 中已知的 library name 的版本号
  const versions = versionInfos;
  versions.forEach((item: string) => {
    const [key, version] = item.replace(/\s.*/, '').split('@');
    res[key] = version;
  });

  // 对于 umi 未知的 library 版本号，从用户 package.json 中获取，比如 moment
  keys.forEach(key => {
    if (res[key]) {
      return;
    }
    const semverIns = semver.coerce(pkg.dependencies && pkg.dependencies[key]);
    if (!semverIns) {
      error(`Can not find dependencies(${key}) version`);
    }
    res[key] = semverIns.version;
  });
  return res;
}

function renderUrls({
  dependencie = '',
  urls = { development: [], production: [] },
  isDevelopment = false,
  urlTemplate = '',
  version = '',
  publicPath = '/',
}) {
  const targetUrls = isDevelopment ? urls.development : urls.production;
  return (targetUrls || []).map(path => {
    const model = {
      library: dependencie,
      path,
      version,
      publicPath,
    };
    return urlTemplate.replace(/{{ (\w+) }}/g, (str, key) => model[key] || str);
  });
}

function getConfigItem({ config, urlTemplate, version, isDevelopment, publicPath }): IExternalData {
  const { key, global, polyfillExclude = [], scripts, polyfillUrls, styles } = config;
  const renderParams = {
    dependencie: key,
    isDevelopment,
    urlTemplate,
    version,
    publicPath,
  };

  const [dependenciePolyfillUrls, dependencieScriptUrls, dependencieStyleUrls] = [
    polyfillUrls,
    scripts,
    styles,
  ].map(urls => renderUrls({ ...renderParams, urls }));

  return {
    key,
    global,
    scripts: dependenciePolyfillUrls.concat(dependencieScriptUrls),
    styles: dependencieStyleUrls,
    polyfillExclude,
  };
}

// 根据用户数据得到最终的 external 数据
function getExternalData(args: IGetExternalDataParams): IExternalData[] {
  configValidate(args);

  const { pkg, versionInfos, packages, urlTemplate, publicPath } = args;
  const isDevelopment = process.env.NODE_ENV === 'development';
  const externalDependencies = packagesToArray(packages);
  const allExternalVersions = getAllKeyVersions(pkg, versionInfos, externalDependencies);

  return sort(packagesToArray(packages), EXTERNAL_MAP).map((key: string) =>
    getConfigItem({
      config: EXTERNAL_MAP[key],
      urlTemplate,
      version: allExternalVersions[key],
      isDevelopment,
      publicPath,
    }),
  );
}

export default getExternalData;
