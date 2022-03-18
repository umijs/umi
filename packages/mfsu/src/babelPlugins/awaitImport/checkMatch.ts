import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import { winPath } from '@umijs/utils';
import assert from 'assert';
import { isAbsolute } from 'path';
import type { IOpts } from './awaitImport';
import { getAliasedPath } from './getAliasedPath';
import { isExternals } from './isExternals';

// const UNMATCH_LIBS = ['umi', 'dumi', '@alipay/bigfish'];
const RE_NODE_MODULES = /node_modules/;
const RE_UMI_LOCAL_DEV = /umi(-next)?\/packages\//;

function isUmiLocalDev(path: string) {
  return RE_UMI_LOCAL_DEV.test(winPath(path));
}

export function checkMatch({
  value,
  path,
  opts,
  isExportAll,
  depth,
  cache,
  filename,
}: {
  value: string;
  path?: Babel.NodePath;
  opts?: IOpts;
  isExportAll?: boolean;
  depth?: number;
  cache?: Map<string, any>;
  filename?: string;
}): { isMatch: boolean; replaceValue: string } {
  let isMatch;
  let replaceValue = '';
  depth = depth || 1;

  assert(
    depth <= 10,
    `endless loop detected in checkMatch, please check your alias config.`,
  );

  opts = opts || {};
  const remoteName = opts.remoteName || 'mf';
  // FIXME: hard code for vite mode
  value = value.replace(/^@fs\//, '/');
  if (
    // unMatch specified libs
    opts.unMatchLibs?.includes(value) ||
    // do not match bundler-webpack/client/client/client.js
    value.includes('client/client/client.js') ||
    // already handled
    value.startsWith(`${remoteName}/`) ||
    // don't match dynamic path
    // e.g. @umijs/deps/compiled/babel/svgr-webpack.js?-svgo,+titleProp,+ref!./umi.svg
    winPath(value).includes('babel/svgr-webpack') ||
    // don't match webpack loader
    // e.g. !!dumi-raw-code-loader!/path/to/VerticalProgress/index.module.less?dumi-raw-code
    value.startsWith('!!') ||
    // don't match externals
    isExternals({ value, externals: opts.externals }) ||
    // relative import
    value.startsWith('.')
  ) {
    isMatch = false;
  } else if (isAbsolute(value)) {
    isMatch = RE_NODE_MODULES.test(value) || isUmiLocalDev(value);
  } else {
    const aliasedPath = getAliasedPath({
      value,
      alias: opts.alias || {},
    });
    if (aliasedPath) {
      return checkMatch({
        value: aliasedPath,
        path,
        opts,
        isExportAll,
        depth: depth + 1,
        cache,
        filename,
      });
    } else {
      isMatch = true;
    }
  }

  if (isMatch && isExportAll) {
    isMatch = !!(opts.exportAllMembers && value in opts.exportAllMembers);
  }

  if (isMatch) {
    replaceValue = `${remoteName}/${winPath(value)}`;
  }

  // @ts-ignore
  const file = path?.hub.file.opts.filename || filename;
  opts.onTransformDeps?.({
    sourceValue: value,
    replaceValue,
    isMatch,
    file,
  });

  if (cache) {
    let mod;
    if (cache.has(file)) {
      mod = cache.get(file);
    } else {
      mod = {
        matched: new Set(),
        unMatched: new Set(),
      };
      cache.set(file, mod);
    }

    mod[isMatch ? 'matched' : 'unMatched'].add({
      sourceValue: value,
      replaceValue,
      file,
    });
  }

  // console.log(
  //   '> check',
  //   // @ts-ignore
  //   path.hub.file.opts.filename,
  //   value,
  //   cache,
  //   'isMatch',
  //   isMatch,
  // );

  return {
    isMatch,
    replaceValue,
  };
}

// TODO: REMOVE ME
export function getPath({ value, opts }: { value: string; opts: IOpts }) {
  const alias = opts.alias || {};
  for (const key of Object.keys(alias)) {
    if (value.startsWith(key)) {
      return value.replace(key, alias[key]);
    }
  }
  return value;
}
