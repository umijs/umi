import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { ROUTE_FILE } from './constants';

const DOT_JS = '.js';

export default function getRouteConfig(root, dirPath = '') {
  const path = join(root, dirPath);
  const files = readdirSync(path);

  return files.reduce((memo, file) => {
    if (file === '.' || file === '..') return memo;
    const stats = statSync(join(path, file));
    if (stats.isFile() && extname(file) === DOT_JS) {
      const fullPath = join(dirPath, basename(file, DOT_JS));
      return {
        ...memo,
        [`/${fullPath}.html`]: `${fullPath}${DOT_JS}`,
      };
    } else if (stats.isDirectory()) {
      const fullPath = join(dirPath, file);
      if (existsSync(join(root, fullPath, ROUTE_FILE))) {
        if (existsSync(join(root, `${fullPath}${DOT_JS}`))) {
          throw new Error(
            `路由冲突，src/page 目录下同时存在 "${fullPath}${
              DOT_JS
            }" 和 "${join(fullPath, ROUTE_FILE)}"，两者指向同一路由。`,
          );
        }
        return {
          ...memo,
          [`/${fullPath}.html`]: join(fullPath, ROUTE_FILE),
        };
      } else {
        return {
          ...memo,
          ...getRouteConfig(root, fullPath),
        };
      }
    } else {
      return memo;
    }
  }, {});
}

// TODO：dev 模式下如果每次修改 pages 下的内容都重新生成配置，可能会有性能问题
