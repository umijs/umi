import { join, extname } from 'path';
import { existsSync } from 'fs';
import assert from 'assert';
import extend from 'extend2';

export function getConfigFile(cwd) {
  const files = process.env.UMI_CONFIG_FILE
    ? process.env.UMI_CONFIG_FILE.split(',').filter(v => v && v.trim())
    : ['.umirc.js', 'config/config.js'];
  const validFiles = files.filter(f => existsSync(join(cwd, f)));
  assert(
    validFiles.length <= 1,
    `Multiple config files (${validFiles.join(
      ', ',
    )}) were detected, please keep only one.`,
  );
  return validFiles[0] && join(cwd, validFiles[0]);
}

export function addAffix(file, affix) {
  const ext = extname(file);
  return file.replace(new RegExp(`${ext}$`), `.${affix}${ext}`);
}

function defaultOnError(e) {
  console.error(e);
}

function requireFile(f, opts = {}) {
  if (!existsSync(f)) {
    return {};
  }

  const { onError = defaultOnError } = opts;
  let ret = {};
  try {
    ret = require(f) || {}; // eslint-disable-line
  } catch (e) {
    onError(e, f);
  }
  // support esm + babel transform
  return ret.default || ret;
}

export function normalizeConfig(config) {
  // Merge config.context to each page
  if (config.context && config.pages) {
    Object.keys(config.pages).forEach(key => {
      const page = config.pages[key];
      page.context = {
        ...config.context,
        ...page.context,
      };
    });
  }

  // pages 配置补丁
  // /index -> /index.html
  // index -> /index.html
  if (config.pages) {
    const htmlSuffix = !!(
      config.exportStatic &&
      typeof config.exportStatic === 'object' &&
      config.exportStatic.htmlSuffix
    );
    config.pages = Object.keys(config.pages).reduce((memo, key) => {
      let newKey = key;
      if (
        htmlSuffix &&
        newKey.slice(-1) !== '/' &&
        newKey.slice(-5) !== '.html'
      ) {
        newKey = `${newKey}.html`;
      }
      if (newKey.charAt(0) !== '/') {
        newKey = `/${newKey}`;
      }
      memo[newKey] = config.pages[key];
      return memo;
    }, {});
  }

  return config;
}

export function mergeConfigs(...configs) {
  return extend(true, ...configs);
}

export function getConfigByConfigFile(configFile, opts = {}) {
  const umiEnv = process.env.UMI_ENV;
  const isDev = process.env.NODE_ENV === 'development';
  const { defaultConfig, onError } = opts;

  const requireOpts = { onError };
  const configs = [
    defaultConfig,
    requireFile(configFile, requireOpts),
    umiEnv && requireFile(addAffix(configFile, umiEnv), requireOpts),
    isDev && requireFile(addAffix(configFile, 'local'), requireOpts),
  ];
  return normalizeConfig(mergeConfigs(...configs));
}

export function getConfigPaths(cwd) {
  const env = process.env.UMI_ENV;
  return [
    join(cwd, 'config/'),
    join(cwd, '.umirc.js'),
    join(cwd, '.umirc.local.js'),
    ...(env ? [join(cwd, `.umirc.${env}.js`)] : []),
  ];
}

export function cleanConfigRequireCache(cwd) {
  const paths = getConfigPaths(cwd);
  Object.keys(require.cache).forEach(file => {
    if (
      paths.some(path => {
        return file.indexOf(path) === 0;
      })
    ) {
      delete require.cache[file];
    }
  });
}

export default function(opts = {}) {
  const { cwd, defaultConfig } = opts;
  const absConfigFile = getConfigFile(cwd);

  // 一定要主的 config 文件，UMI_ENV 才会生效
  if (absConfigFile) {
    return getConfigByConfigFile(absConfigFile, {
      defaultConfig,
    });
  } else {
    return {};
  }
}
