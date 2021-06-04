import { lodash } from '@umijs/utils';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
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
};
