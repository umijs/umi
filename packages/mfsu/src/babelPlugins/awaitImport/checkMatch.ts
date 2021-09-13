import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import { winPath } from '@umijs/utils';
import { isAbsolute } from 'path';
import type { IOpts } from './awaitImport';
import { getAliasedPath } from './getAliasedPath';
import { isExternals } from './isExternals';

// const UNMATCH_LIBS = ['umi', 'dumi', '@alipay/bigfish'];
const RE_NODE_MODULES = /node_modules/;
const RE_UMI_LOCAL_DEV = /umi\/packages\//;

export function checkMatch({
  value,
  path,
  opts,
  isExportAll,
}: {
  value: string;
  path: Babel.NodePath;
  opts: IOpts;
  isExportAll?: boolean;
}) {
  let isMatch = false;
  let replaceValue = '';

  const remoteName = opts.remoteName || 'mf';
  if (
    // unMatch specified libs
    opts.unMatchLibs?.includes(value) ||
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
    isMatch = RE_NODE_MODULES.test(value) || RE_UMI_LOCAL_DEV.test(value);
  } else {
    const aliasedPath = getAliasedPath({
      value,
      alias: opts.alias || {},
    });
    if (aliasedPath) {
      isMatch =
        RE_NODE_MODULES.test(aliasedPath) || RE_UMI_LOCAL_DEV.test(aliasedPath);
    } else {
      isMatch = true;
    }
  }

  if (isMatch && isExportAll) {
    isMatch = !!(opts.exportAllMembers && value in opts.exportAllMembers);
  }

  if (isMatch) {
    replaceValue = `${remoteName}/${getPath({ value, opts })}`;
  }

  opts.onTransformDeps?.({
    sourceValue: value,
    replaceValue,
    isMatch,
    // @ts-ignore
    file: path.hub.file.opts.filename,
  });

  return {
    isMatch,
    replaceValue,
  };
}

export function getPath({ value, opts }: { value: string; opts: IOpts }) {
  const alias = opts.alias || {};
  for (const key of Object.keys(alias)) {
    if (value.startsWith(key)) {
      return value.replace(key, alias[key]);
    }
  }
  return value;
}
