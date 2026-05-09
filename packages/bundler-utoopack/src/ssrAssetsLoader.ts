import { winPath } from '@umijs/utils';

function ensureLastSlash(path: string) {
  return path.endsWith('/') ? path : path + '/';
}

export default function ssrAssetsLoader(this: any) {
  const options = this.getOptions?.() || {};
  const cwd = winPath(options.cwd || this.rootContext || process.cwd());
  const filename = winPath(this.resourcePath).replace(ensureLastSlash(cwd), '');

  return `export default global.g_getAssets(${JSON.stringify(filename)});`;
}
