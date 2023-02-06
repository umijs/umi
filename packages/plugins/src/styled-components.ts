import { winPath } from '@umijs/utils';
import { dirname } from 'path';
import { IApi } from 'umi';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  api.describe({
    key: 'styledComponents',
    config: {
      schema(Joi) {
        return Joi.object({
          babelPlugin: Joi.object(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyBabelPresetOpts((memo) => {
    if (api.env === 'development') {
      memo.pluginStyledComponents = {
        ...api.config.styledComponents.babelPlugin,
      };
    }
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
