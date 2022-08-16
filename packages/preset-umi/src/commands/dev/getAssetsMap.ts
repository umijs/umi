const UMI_ASSETS_REG = {
  js: /^umi(\..+)?\.js$/,
  css: /^umi(\..+)?\.css$/,
};
const HOT_UPDATE = '.hot-update.';

export function getAssetsMap(opts: { stats: any; publicPath: string }) {
  const { stats, publicPath } = opts;
  const displayPublicPath = publicPath === 'auto' ? '/' : publicPath;

  let ret: Record<string, string[]> = {};
  let json = stats.toJson();
  const entrypoints = json.entrypoints || json.children[0].entrypoints;
  for (const asset of entrypoints['umi'].assets) {
    if (
      !asset.name.includes(HOT_UPDATE) &&
      UMI_ASSETS_REG.js.test(asset.name)
    ) {
      ret['umi.js'] = [`${displayPublicPath}${asset.name}`];
    }
    if (UMI_ASSETS_REG.css.test(asset.name)) {
      ret['umi.css'] = [`${displayPublicPath}${asset.name}`];
    }
  }
  return ret;
}
