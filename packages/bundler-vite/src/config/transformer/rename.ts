import type { IConfigProcessor } from '.';

const MAPPING = {
  extraVitePlugins: 'plugins',
  inlineLimit: 'build.assetsInlineLimit',
  manifest: 'build.manifest',
  outputPath: 'build.outDir',
  publicPath: 'base',
  jsMinifier: 'build.minify',
  jsMinifierOptions: 'build.terserOptions',
};

/**
 * set config value by field path
 * @param config  original origin
 * @param path    field path
 * @param value   value
 */
function setConfigByPath(config: any, path: string, value: any) {
  const fields = path.split('.');

  fields.reduce((memo, field, i) => {
    const isLastVar = i === fields.length - 1;

    if (isLastVar) {
      memo[field] = value;
    } else if (!(field in memo)) {
      memo[field] = {};
    }

    return memo[field];
  }, config);
}

/**
 * rename umi user config fields to vite's, which can be rename directly
 */
export default (function rename(userConfig) {
  const config = {};

  Object.entries(MAPPING).forEach(([field, mapping]) => {
    // convert config with mapping name if it exists
    if (userConfig[field] !== undefined) {
      setConfigByPath(config, mapping, userConfig[field]);
    }
  });

  return config;
} as IConfigProcessor);
