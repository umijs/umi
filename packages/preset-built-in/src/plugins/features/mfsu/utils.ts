import { lodash, winPath } from '@umijs/utils';
import { init, parse } from 'es-module-lexer';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'fs';
import { join } from 'path';
import { Deps } from './build';

// a/b/c/* => a/b/c/x,a/b/c/y ,a/b/c/z
export const getFuzzyIncludes = (include: string) => {
  const includeDeepArray = include.split('/');
  const resolvePath = join(
    process.cwd(),
    'node_modules',
    includeDeepArray.slice(0, includeDeepArray.length - 1).join('/'),
  );
  const dir = readdirSync(resolvePath);
  const includes = dir
    .map((fileName) => {
      if (fileName.endsWith('.d.ts')) {
        return;
      }
      return includeDeepArray
        .slice(0, includeDeepArray.length - 1)
        .concat(fileName.split('.')[0])
        .join('/');
    })
    .filter(Boolean);
  return includes;
};

type DiffResultType = 'ADD' | 'REMOVE' | 'EQUAL' | 'MODIFY'; // 增加 ｜ 删除 ｜ 相等 ｜ 更改（更改依赖版本或删除同时更改依赖版本）

export const dependenceDiff = (
  prevDeps: Deps,
  curDeps: Deps,
): DiffResultType => {
  if (lodash.isEqual(prevDeps, curDeps)) {
    return 'EQUAL';
  }
  const prevDepKeys = Object.keys(prevDeps);
  const curDepKeys = Object.keys(curDeps);

  if (prevDepKeys.length === curDepKeys.length) {
    if (
      lodash.intersection(prevDepKeys, curDepKeys).length === prevDepKeys.length
    ) {
      // 用户依赖数量不变，但不完全相等，说明改变了某依赖的版本
      return 'MODIFY';
    }
  }

  // 依赖数量变多
  if (curDepKeys.length > prevDepKeys.length) {
    return 'ADD';
  } else {
    // 依赖数量变少时，需要同时关注用户是否改变了版本
    const difference = lodash.difference(prevDepKeys, curDepKeys);
    for (let i = 0; i < prevDepKeys.length; i++) {
      const key = prevDepKeys[i];
      if (!difference.includes(key) && prevDeps[key] !== curDeps[key]) {
        return 'MODIFY';
      }
    }
  }

  return 'REMOVE';
};

export const shouldBuild = (prevDeps: Deps, curDeps: Deps): boolean => {
  const result = dependenceDiff(prevDeps, curDeps);
  if (result === 'MODIFY' || result === 'ADD') {
    return true;
  }
  return false;
};

export const copy = (fromDir: string, toDir: string) => {
  try {
    const fn = (dir: string, preserveDir: string) => {
      const _dir = readdirSync(dir);
      _dir.forEach((value) => {
        const _path = join(dir, value);
        const stat = statSync(_path);
        if (stat.isDirectory()) {
          const _toDir = join(toDir, preserveDir, value);
          if (!existsSync(_toDir)) {
            mkdirSync(_toDir);
          }
          fn(_path, join(preserveDir, value));
        } else {
          const toDest = join(toDir, preserveDir);
          copyFileSync(_path, join(toDest, value));
        }
      });
    };
    fn(fromDir, '');
  } catch (error) {
    throw error;
  }
};

export const filenameFallback = async (absPath: string): Promise<string> => {
  try {
    const exts = ['.esm.js', '.js', '.ts', '.jsx', '.tsx'];
    for (let i = 0; i < exts.length; i++) {
      const filename = absPath + exts[i];
      if (existsSync(filename)) {
        return await parseFileExport(filename, filename);
      }
    }
    const indexJs = join(absPath, 'index.js'); // runtime-regenerator
    if (existsSync(indexJs)) {
      return parseFileExport(indexJs, indexJs);
    }
    return `import "${absPath}"; // filename fallback`;
  } catch (error) {
    throw error;
  }
};

export const getExportStatement = (
  importFrom: string,
  cjs: boolean,
  hasDefault: boolean,
) =>
  cjs
    ? `import _ from "${winPath(
        importFrom,
      )}";\nexport default _;\nexport * from "${winPath(importFrom)}";`
    : `${
        hasDefault
          ? `import _ from "${winPath(importFrom)}";\nexport default _;`
          : ''
      }\nexport * from "${winPath(importFrom)}";`;

const parseFileExport = async (filePath: string, packageName: string) => {
  try {
    if (!existsSync(filePath)) {
      return '';
    }
    const file = readFileSync(filePath, 'utf-8');
    await init;
    try {
      var [imports, exports] = parse(file);
    } catch (error) {
      console.log(error);
      throw `parse ${filePath} error.` + error;
    }
    // cjs
    if (!imports.length && !exports.length) {
      return getExportStatement(packageName, true, false);
    }
    // esm
    if (exports.length) {
      return getExportStatement(
        packageName,
        false,
        exports.includes('default'),
      );
    } else {
      return `import "${packageName}"; // no export fallback`;
    }
  } catch (error) {
    throw error;
  }
};

const readPackageImport = (
  packagePath: string,
  packageName: string,
): Promise<string> => {
  const packageJson = join(packagePath, 'package.json');
  try {
    if (existsSync(packageJson)) {
      const { module, main } = JSON.parse(
        readFileSync(packageJson, 'utf-8') || '{}',
      );
      const entry = join(packagePath, module || main || 'index.js');
      return parseFileExport(entry, packageName);
    } else {
      // try add ext. such as: 'regenerator-runtime/runtime' means 'regenerator-runtime/runtime.js'
      return filenameFallback(packagePath);
    }
  } catch (err) {
    throw err;
  }
};

const readPathImport = async (absPath: string) => {
  try {
    if (existsSync(absPath)) {
      if (statSync(absPath).isDirectory()) {
        return readPackageImport(absPath, absPath);
      } else {
        return parseFileExport(absPath, absPath);
      }
    } else {
      return filenameFallback(absPath);
    }
  } catch (error) {
    throw error;
  }
};

export const figureOutExport = async (
  cwd: string,
  entry: string,
): Promise<string> => {
  try {
    if (entry.startsWith('/') || /^[A-Za-z]\:\//.test(winPath(entry))) {
      return readPathImport(winPath(entry));
    } else {
      return readPackageImport(join(cwd, 'node_modules', entry), entry);
    }
  } catch (error) {
    throw error;
  }
};
