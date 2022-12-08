import { dirname } from 'path';
import { IApi } from 'umi';

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

  // reexports with types
  const libPath = dirname(require.resolve('styled-components/package'));
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'index.tsx',
      content: `
import styled, { ThemeProvider, createGlobalStyle, css, keyframes, StyleSheetManager, useTheme } from '${libPath}';
export { styled, ThemeProvider, createGlobalStyle, css, keyframes, StyleSheetManager, useTheme };
      `,
    });
  });
};
