import { getUmiEntryFilesFromStats } from '../../utils/extractEntryAssets';

export function getAssetsMap(opts: { stats: any; publicPath: string }) {
  const { stats, publicPath } = opts;
  const displayPublicPath = publicPath === 'auto' ? '/' : publicPath;

  let ret: Record<string, string[]> = {};
  for (const asset of getUmiEntryFilesFromStats(stats)) {
    const ext = asset.endsWith('.css') ? 'css' : 'js';
    ret[`umi.${ext}`] = [`${displayPublicPath}${asset}`];
  }
  return ret;
}
