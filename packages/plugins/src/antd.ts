// @ts-ignore
import AntdMomentWebpackPlugin from '@ant-design/moment-webpack-plugin';
import assert from 'assert';
import { dirname, join } from 'path';
import { IApi, RUNTIME_TYPE_FILE_NAME } from 'umi';
import { deepmerge, Mustache, semver, winPath } from 'umi/plugin-utils';
import { TEMPLATES_DIR } from './constants';
import { resolveProjectDep } from './utils/resolveProjectDep';
import { withTmpPath } from './utils/withTmpPath';

const ANTD_TEMPLATES_DIR = join(TEMPLATES_DIR, 'antd');

export default (api: IApi) => {
  let pkgPath: string;
  let antdVersion = '4.0.0';
  try {
    pkgPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'antd',
      }) || dirname(require.resolve('antd/package.json'));
    antdVersion = require(`${pkgPath}/package.json`).version;
  } catch (e) {}

  const isAntd5 = antdVersion.startsWith('5');

  // App components exist only from 5.1.0 onwards
  const appComponentAvailable = semver.gte(antdVersion, '5.1.0');
  const appConfigAvailable = semver.gte(antdVersion, '5.3.0');
  const day2MomentAvailable = semver.gte(antdVersion, '5.0.0');

  api.describe({
    config: {
      schema({ zod }) {
        return zod
          .object({
            configProvider: zod.record(zod.any()),
            // themes
            dark: zod.boolean(),
            compact: zod.boolean(),
            // babel-plugin-import
            import: zod.boolean(),
            // less or css, default less
            style: zod
              .enum(['less', 'css'])
              .describe('less or css, default less'),
            theme: zod.record(zod.any()),
            // Only antd@5.1.0 is supported
            appConfig: zod
              .record(zod.any())
              .describe('Only antd@5.1.0 is supported'),
            // DatePicker & Calendar use moment version
            momentPicker: zod.boolean().describe('Only antd@5.x is supported'),
          })
          .deepPartial();
      },
    },
    enableBy({ userConfig }) {
      // 由于本插件有 api.modifyConfig 的调用，以及 Umi 框架的限制
      // 在其他插件中通过 api.modifyDefaultConfig 设置 antd 并不能让 api.modifyConfig 生效
      // 所以这里通过环境变量来判断是否启用
      return process.env.UMI_PLUGIN_ANTD_ENABLE || userConfig.antd;
    },
  });

  api.addRuntimePluginKey(() => ['antd']);

  function checkPkgPath() {
    if (!pkgPath) {
      throw new Error(`Can't find antd package. Please install antd first.`);
    }
  }

  api.modifyAppData((memo) => {
    checkPkgPath();
    const version = require(`${pkgPath}/package.json`).version;
    memo.antd = {
      pkgPath,
      version,
    };
    return memo;
  });

  api.modifyConfig((memo) => {
    checkPkgPath();

    let antd = memo.antd || {};
    // defaultConfig 的取值在 config 之后，所以改用环境变量传默认值
    if (process.env.UMI_PLUGIN_ANTD_ENABLE) {
      const { defaultConfig } = JSON.parse(process.env.UMI_PLUGIN_ANTD_ENABLE);
      // 通过环境变量启用时，保持 memo.antd 与局部变量 antd 的引用关系，方便后续修改
      memo.antd = antd = Object.assign(defaultConfig, antd);
    }

    // antd import
    memo.alias.antd = pkgPath;

    // antd 5 里面没有变量了，less 跑不起来。注入一份变量至少能跑起来
    if (isAntd5) {
      const theme = require('@ant-design/antd-theme-variable');
      memo.theme = {
        ...theme,
        ...memo.theme,
      };
      if (memo.antd?.import) {
        // 只是在 antd@5 的时候，这个配置无效，不应该直接报错退出
        api.logger.warn(
          `The configuration antd.import is invalid in Ant Design version 5.x .`,
        );
      }
    }

    // dark mode & compact mode
    if (antd.dark || antd.compact) {
      if (isAntd5) {
        // 在运行时修改使用这些配置
      } else {
        const { getThemeVariables } = require(`${pkgPath}/dist/theme`);
        memo.theme = {
          ...getThemeVariables(antd),
          ...memo.theme,
        };
      }
    }

    // antd theme
    memo.theme = {
      'root-entry-name': 'default',
      ...memo.theme,
    };

    // allow use `antd.theme` as the shortcut of `antd.configProvider.theme`
    if (antd.theme) {
      assert(isAntd5, `antd.theme is only valid when antd is 5`);
      antd.configProvider ??= {};
      // priority: antd.theme > antd.configProvider.theme
      antd.configProvider.theme = deepmerge(
        antd.configProvider.theme || {},
        antd.theme,
      );
      if (antd.configProvider.theme.algorithm) {
        api.logger.error(
          `When configure 'algorithm' in the configuration file, an exception occurs. Please configure 'algorithm' in the runtime configuration instead. https://github.com/umijs/umi/issues/11156`,
        );
      }
    }

    if (antd.appConfig) {
      if (!appComponentAvailable) {
        delete antd.appConfig;
        api.logger.warn(
          `antd.appConfig is only available in version 5.1.0 and above, but you are using version ${antdVersion}`,
        );
      } else if (
        !appConfigAvailable &&
        Object.keys(antd.appConfig).length > 0
      ) {
        api.logger.warn(
          `versions [5.1.0 ~ 5.3.0) only allows antd.appConfig to be set to \`{}\``,
        );
      }
    }

    return memo;
  });

  // Webpack
  api.chainWebpack((memo) => {
    if (api.config.antd.momentPicker) {
      if (day2MomentAvailable) {
        memo.plugin('antd-moment-webpack-plugin').use(AntdMomentWebpackPlugin);
      } else {
        api.logger.warn(
          `MomentPicker is only available in version 5.0.0 and above, but you are using version ${antdVersion}`,
        );
      }
    }
    return memo;
  });

  // babel-plugin-import
  api.addExtraBabelPlugins(() => {
    // only enable style for non-antd@5
    return api.config.antd?.import && !api.appData.vite && !isAntd5
      ? [
          [
            require.resolve('babel-plugin-import'),
            {
              libraryName: 'antd',
              libraryDirectory: 'es',
              // style 的值为 true 或 css
              style: api.config.antd?.style === 'css' ? 'css' : true,
            },
            'antd',
          ],
        ]
      : [];
  });

  // antd config provider & app component
  api.onGenerateFiles(() => {
    const {
      configProvider,
      appConfig,
      dark = false,
      compact = false,
    } = api.config.antd;
    const withAppConfig = appConfigAvailable && !!appConfig;
    // 当 antd@5 时，dark 和 compact 通过 ConfigProvider 的 theme 实现
    const withConfigProvider =
      !!configProvider || (isAntd5 && (dark || compact)) || withAppConfig;

    api.writeTmpFile({
      path: `runtime.tsx`,
      context: {
        isAntd5,
        configProvider:
          withConfigProvider && JSON.stringify(configProvider || {}),
        appConfig: appComponentAvailable && JSON.stringify(appConfig),
        dark,
        compact,
      },
      tplPath: winPath(join(ANTD_TEMPLATES_DIR, 'runtime.ts.tpl')),
    });

    api.writeTmpFile({
      path: 'types.d.ts',
      content: Mustache.render(
        `
{{#withConfigProvider}}
import type { ConfigProviderProps } from 'antd/es/config-provider';
{{/withConfigProvider}}
{{#withAppConfig}}
import type { AppConfig } from 'antd/es/app/context';
{{/withAppConfig}}

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type AntdConfig = Prettify<{
  compact?: boolean;
  dark?: boolean;
}
{{#withConfigProvider}}  & ConfigProviderProps{{/withConfigProvider}}
{{#withAppConfig}}  & { appConfig?: AppConfig }{{/withAppConfig}}
>;

export type RuntimeAntdConfig = (memo: AntdConfig) => AntdConfig;
`.trim(),
        {
          withConfigProvider,
          withAppConfig,
        },
      ),
    });

    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
import type { RuntimeAntdConfig } from './types.d';
export type IRuntimeConfig = {
  antd?: RuntimeAntdConfig
};
      `,
    });
    if (isAntd5) {
      api.writeTmpFile({
        path: 'index.tsx',
        content: `import React from 'react';
import { AntdContext, AntdContextSetter } from './context';
        
export function useAntdConfig() {
  return React.useContext(AntdContext);
}
        
export function useAntdConfigSetter() {
  return React.useContext(AntdContextSetter);
}`,
      });
      api.writeTmpFile({
        path: 'context.tsx',
        content: `import React from 'react';
import { AntdConfig } from './types.d';
        
export const AntdContext = React.createContext<AntdConfig>({});
export const AntdContextSetter = React.createContext((data:AntdConfig)=>{
  console.error('To use this feature, please enable one of the three configurations: antd.dark, antd.compact, antd.configProvider,or antd.appConfig,');
});
`,
      });
    }
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });

  api.addEntryImportsAhead(() => {
    const imports: Awaited<
      ReturnType<Parameters<IApi['addEntryImportsAhead']>[0]['fn']>
    > = [];

    if (isAntd5) {
      // import antd@5 reset style
      imports.push({ source: 'antd/dist/reset.css' });
    } else if (!api.config.antd.import || api.appData.vite) {
      // import antd@4 style if antd.import is not configured
      imports.push({
        source:
          api.config.antd?.style === 'css'
            ? 'antd/dist/antd.css'
            : 'antd/dist/antd.less',
      });
    }

    return imports;
  });
};
