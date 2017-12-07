import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { ROUTE_FILES } from './constants';

const DOT_JS = '.js';
const EXT_NAMES = ['.js', '.jsx', '.ts', '.tsx'];

export default function getRouteConfig(root, dirPath = '') {
  const path = join(root, dirPath);
  const files = readdirSync(path);

  return files.reduce((memo, file) => {
    // 包含 ., .., 以及其他 dotfile
    if (file.charAt(0) === '.') return memo;
    const stats = statSync(join(path, file));
    const ext = extname(file);
    if (stats.isFile() && EXT_NAMES.indexOf(ext) > -1) {
      const fullPath = join(dirPath, basename(file, ext));
      return {
        ...memo,
        [`/${fullPath}.html`]: `${fullPath}${ext}`,
      };
    } else if (stats.isDirectory()) {
      const fullPath = join(dirPath, file);
      for (const routeFile of ROUTE_FILES) {
        if (existsSync(join(root, fullPath, routeFile))) {
          if (existsSync(join(root, `${fullPath}${DOT_JS}`))) {
            throw new Error(
              `路由冲突，src/page 目录下同时存在 "${fullPath}${
                DOT_JS
              }" 和 "${join(fullPath, routeFile)}"，两者指向同一路由。`,
            );
          }
          return {
            ...memo,
            [`/${fullPath}.html`]: join(fullPath, routeFile),
          };
        }
      }
      return {
        ...memo,
        ...getRouteConfig(root, fullPath),
      };
    } else {
      return memo;
    }
  }, {});
}

// TODO：dev 模式下如果每次修改 pages 下的内容都重新生成配置，可能会有性能问题
