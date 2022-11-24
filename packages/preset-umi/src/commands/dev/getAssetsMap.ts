const UMI_ASSETS_REG = {
  js: /^umi(\..+)?\.js$/,
  css: /^umi(\..+)?\.css$/,
};

const HOT_UPDATE = '.hot-update.';

export function getAssetsMap(opts: { stats: any; publicPath: string }) {
  const { stats, publicPath } = opts;
  const displayPublicPath = publicPath === 'auto' ? '/' : publicPath;

  let ret: Record<string, string[]> = {};
  const realStats = stats.stats ? stats.stats[0] : stats;
  const assets = Object.keys(realStats.compilation.assets);
  for (const asset of assets) {
    if (!asset.includes(HOT_UPDATE)) {
      if (UMI_ASSETS_REG.js.test(asset)) {
        ret['umi.js'] = [`${displayPublicPath}${asset}`];
      }
    }
    if (UMI_ASSETS_REG.css.test(asset)) {
      ret['umi.css'] = [`${displayPublicPath}${asset}`];
    }
  }
  return ret;
}
