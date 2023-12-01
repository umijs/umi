// @ts-ignore
import AntdMomentWebpackPlugin from '@ant-design/moment-webpack-plugin';
import assert from 'assert';
import { dirname, join } from 'path';
import { IApi, RUNTIME_TYPE_FILE_NAME } from 'umi';
import { deepmerge, semver, winPath } from 'umi/plugin-utils';
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

  const isV5 = antdVersion.startsWith('5');
  const isV4 = antdVersion.startsWith('4');
  // App components exist only from 5.1.0 onwards
  const appComponentAvailable = semver.gte(antdVersion, '5.1.0');
  const appConfigAvailable = semver.gte(antdVersion, '5.3.0');
  const day2MomentAvailable = semver.gte(antdVersion, '5.0.0');

  api.describe({
    config: {
      schema({ zod }) {
        const commonSchema: Parameters<typeof zod.object>[0] = {
          dark: zod.boolean(),
          compact: zod.boolean(),
          // babel-plugin-import
          import: zod.boolean(),
          // less or css, default less
          style: zod
            .enum(['less', 'css'])
            .describe('less or css, default less'),
        };
        const createZodRecordWithSpecifiedPartial = (
          partial: Parameters<typeof zod.object>[0],
        ) => {
          const keys = Object.keys(partial);
          return zod.union([
            zod.object(partial),
            zod.record(zod.any()).refine((obj) => {
              return !keys.some((key) => key in obj);
            }),
          ]);
        };
        const createV5Schema = () => {
          // Reason: https://github.com/umijs/umi/pull/11924
          // Refer:  https://github.com/ant-design/ant-design/blob/master/components/theme/interface/components.ts
          const componentNameSchema = zod.string().refine(
            (value) => {
              const firstLetter = value.slice(0, 1);
              return firstLetter === firstLetter.toUpperCase(); // first letter is uppercase
            },
            {
              message:
                'theme.components.[componentName] needs to be in PascalCase, e.g. theme.components.Button',
            },
          );
          const themeSchema = createZodRecordWithSpecifiedPartial({
            components: zod.record(componentNameSchema, zod.record(zod.any())),
          });
          const configProvider = createZodRecordWithSpecifiedPartial({
            theme: themeSchema,
          });

          return zod
            .object({
              ...commonSchema,
              theme: themeSchema.describe('Shortcut of `configProvider.theme`'),
              appConfig: zod
                .record(zod.any())
                .describe('Only >= antd@5.1.0 is supported'),
              momentPicker: zod
                .boolean()
                .describe('DatePicker & Calendar use moment version'),
              styleProvider: zod.record(zod.any()),
              configProvider,
            })
            .deepPartial();
        };
        const createV4Schema = () => {
          return zod
            .object({
              ...commonSchema,
              configProvider: zod.record(zod.any()),
            })
            .deepPartial();
        };
        if (isV5) {
          return createV5Schema();
        }
        if (isV4) {
          return createV4Schema();
        }
        return zod.object({});
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
    if (isV5) {
      const theme = require('@ant-design/antd-theme-variable');
      memo.theme = {
        ...theme,
        ...memo.theme,
      };
      if (memo.antd?.import) {
        const errorMessage = `Can't set antd.import while using antd5 (${antdVersion})`;

        api.logger.fatal(
          'please change config antd.import to false, then start server again',
        );

        throw Error(errorMessage);
      }
    }

    // 只有 antd@4 才需要将 compact 和 dark 传入 less 变量
    if (isV4) {
      if (antd.dark || antd.compact) {
        const { getThemeVariables } = require('antd/dist/theme');
        memo.theme = {
          ...getThemeVariables(antd),
          ...memo.theme,
        };
      }

      memo.theme = {
        'root-entry-name': 'default',
        ...memo.theme,
      };
    }

    // allow use `antd.theme` as the shortcut of `antd.configProvider.theme`
    if (antd.theme) {
      assert(isV5, `antd.theme is only valid when antd is 5`);
      antd.configProvider ??= {};
      // priority: antd.theme > antd.configProvider.theme
      antd.configProvider.theme = deepmerge(
        antd.configProvider.theme || {},
        antd.theme,
      );

      // https://github.com/umijs/umi/issues/11156
      assert(
        !antd.configProvider.theme.algorithm,
        `The 'algorithm' option only available for runtime config, please move it to the runtime plugin, see: https://umijs.org/docs/max/antd#运行时配置`,
      );
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

    // 如果使用静态主题配置，需要搭配 ConfigProvider ，否则无效，我们自动开启它
    if (antd.dark || antd.compact) {
      antd.configProvider ??= {};
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
    const style = api.config.antd.style || 'less';

    if (api.config.antd.import && !api.appData.vite) {
      return [
        [
          require.resolve('babel-plugin-import'),
          {
            libraryName: 'antd',
            libraryDirectory: 'es',
            ...(isV5 ? {} : { style: style === 'less' || 'css' }),
          },
          'antd',
        ],
      ];
    }

    return [];
  });

  const lodashPkg = dirname(require.resolve('lodash/package.json'));
  const lodashPath = {
    merge: winPath(join(lodashPkg, 'merge')),
  };

  // antd config provider & app component
  api.onGenerateFiles(() => {
    const withConfigProvider = !!api.config.antd.configProvider;
    const withAppConfig = appConfigAvailable && !!api.config.antd.appConfig;
    const styleProvider = api.config.antd.styleProvider;
    const userInputCompact = api.config.antd.compact;
    const userInputDark = api.config.antd.dark;

    const ieTarget = !!api.config.targets?.ie || !!api.config.legacy;

    let styleProviderConfig: any = false;

    if (isV5 && (ieTarget || styleProvider)) {
      const cssinjs =
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: '@ant-design/cssinjs',
        }) || dirname(require.resolve('@ant-design/cssinjs/package.json'));

      if (cssinjs) {
        styleProviderConfig = {
          cssinjs: winPath(cssinjs),
        };

        if (ieTarget) {
          styleProviderConfig.hashPriority = 'high';
          styleProviderConfig.legacyTransformer = true;
        }

        styleProviderConfig = {
          ...styleProviderConfig,
          ...styleProvider,
        };
      }
    }

    // Template
    const configProvider =
      withConfigProvider && JSON.stringify(api.config.antd.configProvider);
    const appConfig =
      appComponentAvailable && JSON.stringify(api.config.antd.appConfig);
    const enableV5ThemeAlgorithm =
      isV5 && (userInputCompact || userInputDark)
        ? { compact: userInputCompact, dark: userInputDark }
        : false;
    const hasConfigProvider = configProvider || enableV5ThemeAlgorithm;
    // 拥有 `ConfigProvider` 时，我们默认提供修改 antd 全局配置的便捷方法（仅限 antd 5）
    const antdConfigSetter = isV5 && hasConfigProvider;
    api.writeTmpFile({
      path: `runtime.tsx`,
      context: {
        configProvider,
        appConfig,
        styleProvider: styleProviderConfig,
        // 是否启用了 v5 的 theme algorithm
        enableV5ThemeAlgorithm,
        antdConfigSetter,
        lodashPath,
        /**
         * 是否重构了全局静态配置。 重构后需要在运行时将全局静态配置传入到 ConfigProvider 中。
         * 实际上 4.13.0 重构后有一个 bug，真正的 warn 出现在 4.13.1，并且 4.13.1 修复了这个 bug。
         * Resolve issue: https://github.com/umijs/umi/issues/10231
         * `InternalStatic` 指 `Modal.config` 等静态方法，详见：https://github.com/ant-design/ant-design/pull/29285
         */
        disableInternalStatic: semver.gt(antdVersion, '4.13.0'),
      },
      tplPath: winPath(join(ANTD_TEMPLATES_DIR, 'runtime.ts.tpl')),
    });

    api.writeTmpFile({
      path: 'types.d.ts',
      context: {
        withConfigProvider,
        withAppConfig,
      },
      tplPath: winPath(join(ANTD_TEMPLATES_DIR, 'types.d.ts.tpl')),
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

    if (antdConfigSetter) {
      api.writeTmpFile({
        path: 'index.tsx',
        content: `import React from 'react';
import { AntdConfigContext, AntdConfigContextSetter } from './context';

export function useAntdConfig() {
  return React.useContext(AntdConfigContext);
}

export function useAntdConfigSetter() {
  return React.useContext(AntdConfigContextSetter);
}`,
      });
      api.writeTmpFile({
        path: 'context.tsx',
        content: `import React from 'react';
import type { ConfigProviderProps } from 'antd/es/config-provider';

export const AntdConfigContext = React.createContext<ConfigProviderProps>(null!);
export const AntdConfigContextSetter = React.createContext<React.Dispatch<React.SetStateAction<ConfigProviderProps>>>(
  () => {
    console.error(\`The 'useAntdConfigSetter()' method depends on the antd 'ConfigProvider', requires one of 'antd.configProvider' / 'antd.dark' / 'antd.compact' to be enabled.\`);
  }
);
`,
      });
    }
  });

  api.addRuntimePlugin(() => {
    if (
      api.config.antd.styleProvider ||
      api.config.antd.configProvider ||
      (appComponentAvailable && api.config.antd.appConfig)
    ) {
      return [withTmpPath({ api, path: 'runtime.tsx' })];
    }
    return [];
  });

  api.addEntryImportsAhead(() => {
    const style = api.config.antd.style || 'less';
    const imports: Awaited<
      ReturnType<Parameters<IApi['addEntryImportsAhead']>[0]['fn']>
    > = [];

    if (isV5) {
      // import antd@5 reset style
      imports.push({ source: 'antd/dist/reset.css' });
    } else if (!api.config.antd.import || api.appData.vite) {
      // import antd@4 style if antd.import is not configured
      imports.push({
        source: style === 'less' ? 'antd/dist/antd.less' : 'antd/dist/antd.css',
      });
    }

    return imports;
  });
};
