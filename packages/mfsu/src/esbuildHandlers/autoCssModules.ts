import { isStyleFile } from '@umijs/utils';
import { IEsbuildLoaderHandlerParams } from '../types';

const CSS_MODULES_QUERY = '?modules';
const QUERY_LENGTH = CSS_MODULES_QUERY.length;

export function autoCssModulesHandler(opts: IEsbuildLoaderHandlerParams) {
  let { code } = opts;

  let offset = 0;
  opts.imports.forEach((i) => {
    if (i.d < 0 && isStyleFile({ filename: i.n })) {
      // import x from './index.less'
      //   => import x from '
      const importSegment = code.substring(i.ss + offset, i.s + offset);
      // is css module
      if (~importSegment.indexOf(' from')) {
        code = `${code.substring(
          0,
          i.e + offset,
        )}${CSS_MODULES_QUERY}${code.substring(i.e + offset)}`;
        offset += QUERY_LENGTH;
      }
    }
  });

  return code;
}
