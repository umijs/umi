import { lodash, winPath } from '@umijs/utils';
import { dirname } from 'path';
import type { IStyleSheetManager } from 'styled-components';
import { IApi } from 'umi';
import { resolveProjectDep } from './utils/resolveProjectDep';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  api.describe({
    key: 'styledComponents',
    config: {
      schema({ zod }) {
        return zod.object({
          babelPlugin: zod.record(zod.any()).optional(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  // dev:  displayName
  // prod: minify
  api.modifyConfig((memo) => {
    if (api.userConfig.mako || process.env.OKAM) {
      return memo;
    }

    const isProd = api.env === 'production';
    const pluginConfig = {
      // https://github.com/styled-components/babel-plugin-styled-components/blob/f8e9fb480d1645be8be797d73e49686bdf98975b/src/utils/options.js#L11
      topLevelImportPaths: [
        '@umijs/max',
        '@alipay/bigfish',
        'umi',
        'alita',
        '@kmi/kmi',
      ],
      ...(isProd
        ? {
            displayName: false,
          }
        : {}),
      ...(api.config.styledComponents?.babelPlugin || {}),
      ...(api.userConfig.styledComponents?.babelPlugin || {}),
    };
    memo.extraBabelPlugins = [
      ...(memo.extraBabelPlugins || []),
      [require.resolve('babel-plugin-styled-components'), pluginConfig],
    ];
    return memo;
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });

  api.addRuntimePluginKey(() => {
    return ['styledComponents'];
  });

  const SC_NAME = `styled-components`;
  let libPath: string;
  try {
    libPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: SC_NAME,
      }) || dirname(require.resolve(`${SC_NAME}/package.json`));
  } catch (e) {}

  api.modifyConfig((memo) => {
    memo.alias[SC_NAME] = libPath;
    return memo;
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'index.tsx',
      content: `
import styled, { ThemeProvider, createGlobalStyle, css, keyframes, StyleSheetManager, useTheme } from '${winPath(
        libPath,
      )}';
export { styled, ThemeProvider, createGlobalStyle, css, keyframes, StyleSheetManager, useTheme };
      `,
    });

    const styledComponentsRuntimeCode = api.appData.appJS?.exports.includes(
      'styledComponents',
    )
      ? `import { styledComponents as styledComponentsConfig } from '@/app';`
      : `const styledComponentsConfig = {};`;

    const isLegacy =
      !lodash.isEmpty(api.config.targets?.ie) || api.config.legacy;
    const disableCSSOM = !!api.config.qiankun?.slave;
    const providerOptions: IStyleSheetManager = {
      // https://styled-components.com/docs/faqs#vendor-prefixes-are-omitted-by-default
      ...(isLegacy ? { enableVendorPrefixes: true } : {}),
      ...(disableCSSOM ? { disableCSSOMInjection: true } : {}),
    };
    const hasProvider = !lodash.isEmpty(providerOptions);

    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React from 'react';
${hasProvider ? `import { StyleSheetManager } from '${winPath(libPath)}';` : ``}

${styledComponentsRuntimeCode}
export function rootContainer(container) {
  const scConfig =
    typeof styledComponentsConfig === 'function'
      ? styledComponentsConfig()
      : styledComponentsConfig;
  const globalStyle = scConfig.GlobalStyle ? <scConfig.GlobalStyle /> : null;
  const inner = (
    <>
      {globalStyle}
      {container}
    </>
  );
  ${
    hasProvider
      ? `
  return (
    <StyleSheetManager {...${JSON.stringify(providerOptions)}}>
      {inner}
    </StyleSheetManager>
  );
  `
      : 'return inner;'
  }
}
      `,
    });
  });
};
