import { winPath } from '@umijs/utils';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

// similar with resolve.extensions in webpack config
const EXT_NAMES = ['.mjs', '.js', '.jsx', '.ts', '.tsx'];

function getPathWithExt(path: string) {
  if (existsSync(path) && statSync(path).isFile()) {
    return path;
  }

  for (const extName of EXT_NAMES) {
    const newPath = `${path}${extName}`;
    if (existsSync(newPath) && statSync(newPath).isFile()) {
      return newPath;
    }
  }

  return null;
}

function getPathWithPkgJSON(path: string) {
  // TODO: 这里是否会有 symlink 问题?
  if (existsSync(path) && statSync(path).isDirectory()) {
    const pkgPath = join(path, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      // ref: https://webpack.js.org/configuration/resolve/#resolvemainfields
      // TODO: support browser object
      // ref: https://unpkg.alibaba-inc.com/browse/react-dom@17.0.2/package.json
      const indexTarget = join(path, 'index.js');
      return (
        (pkg.module &&
          (getPathWithExt(join(path, pkg.module)) ||
            getPathWithIndexFile(join(path, pkg.module)))) ||
        (pkg.main &&
          (getPathWithExt(join(path, pkg.main)) ||
            getPathWithIndexFile(join(path, pkg.main)))) ||
        getPathWithExt(indexTarget) ||
        getPathWithIndexFile(indexTarget)
      );
    }
  }
  return null;
}

function getPathWithIndexFile(path: string) {
  if (existsSync(path) && statSync(path).isDirectory()) {
    for (const extName of EXT_NAMES) {
      const indexFilePath = join(path, `index${extName}`);
      if (existsSync(indexFilePath) && statSync(indexFilePath).isFile()) {
        return indexFilePath;
      }
    }
  }
  return null;
}

export function getFilePath(path: string) {
  // 1. 文件存在
  // 2. 加后缀
  const pathWithExt = getPathWithExt(path);
  if (pathWithExt) {
    return winPath(pathWithExt);
  }

  // 3. path + package.json
  const pathWithPkgJSON = getPathWithPkgJSON(path);
  if (pathWithPkgJSON) {
    return winPath(pathWithPkgJSON);
  }

  // 4. path + index.js
  const pathWithIndexFile = getPathWithIndexFile(path);
  if (pathWithIndexFile) {
    return winPath(pathWithIndexFile);
  }

  return null;
}

// 当 APP_ROOT 有值，但 依赖(package.json) 仍然安装在 process.cwd() 时
// 返回正常可用的 cwd
export function getProperCwd(cwd: string) {
  const rawCwd = process.cwd();
  const pkgLocationWithCwd = existsSync(join(cwd, 'package.json'));

  if (pkgLocationWithCwd) {
    return cwd;
  }
  return rawCwd;
}
