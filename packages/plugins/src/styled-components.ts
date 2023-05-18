import { winPath } from '@umijs/utils';
import { dirname } from 'path';
import { IApi } from 'umi';
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
    const pluginConfig = {
      // https://github.com/styled-components/babel-plugin-styled-components/blob/f8e9fb480d1645be8be797d73e49686bdf98975b/src/utils/options.js#L11
      topLevelImportPaths: ['umi', '@umijs/max', '@alipay/bigfish'],
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

  const libPath = dirname(require.resolve('styled-components/package'));
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
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
${styledComponentsRuntimeCode}
export function rootContainer(container) {
  const globalStyle = styledComponentsConfig.GlobalStyle ? <styledComponentsConfig.GlobalStyle /> : null;
  return (
    <>
      {globalStyle}
      {container}
    </>
  );
}
      `,
    });
  });
};
