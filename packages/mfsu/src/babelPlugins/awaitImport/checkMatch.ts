import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import { aliasUtils, isLocalDev, winPath } from '@umijs/utils';
import assert from 'assert';
import { isAbsolute, join } from 'path';
import type { IOpts } from './awaitImport';
import { isExternals } from './isExternals';

// const UNMATCH_LIBS = ['umi', 'dumi', '@alipay/bigfish'];
const RE_NODE_MODULES = /node_modules/;

function isUmiLocalDev(path: string) {
  const rootPath = isLocalDev();
  if (rootPath) {
    const winP = winPath(path);
    const pkgP = winPath(join(rootPath, './packages'));
    const libP = winPath(join(rootPath, './libs'));

    return winP.startsWith(pkgP) || winP.startsWith(libP);
  } else {
    return false;
  }
}

function genUnMatchLibsRegex(libs?: Array<string | RegExp>) {
  if (!libs) {
    return null;
  }

  const deps = libs.map((lib) => {
    if (typeof lib === 'string') {
      return `^${lib}$`;
    } else if (lib instanceof RegExp) {
      return lib.source;
    }
  });
  return deps.length ? new RegExp(deps.join('|')) : null;
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
}): { isMatch: boolean; replaceValue: string; value: string } {
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

  const unMatchLibsRegex = genUnMatchLibsRegex(opts.unMatchLibs);

  const mfPathInitial = `${remoteName}/`;

  if (
    // unMatch specified libs
    unMatchLibsRegex?.test(value) ||
    // do not match bundler-webpack/client/client/client.js
    value.includes('client/client/client.js') ||
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
    // already handled
  } else if (value.startsWith(mfPathInitial)) {
    isMatch = true;
  } else if (isAbsolute(value)) {
    isMatch = RE_NODE_MODULES.test(value) || isUmiLocalDev(value);
  } else {
    const aliasedPath = aliasUtils.getAliasValue({
      imported: value,
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
    // in case src file compiled twice or more
    if (value.startsWith(mfPathInitial)) {
      replaceValue = value;
      value = value.replace(mfPathInitial, '');
    } else {
      replaceValue = `${remoteName}/${winPath(value)}`;
    }
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
    value,
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
