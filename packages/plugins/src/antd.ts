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

  const isV5 = antdVersion.startsWith('5');
  const isV4 = antdVersion.startsWith('4');
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
            styleProvider: zod.record(zod.any()),
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

  // antd config provider & app component
  api.onGenerateFiles(() => {
    const withConfigProvider = !!api.config.antd.configProvider;
    const withAppConfig = appConfigAvailable && !!api.config.antd.appConfig;
    const styleProvider = api.config.antd.styleProvider;
    const userInputCompact = api.config.antd.compact;
    const userInputDark = api.config.antd.dark;

    // Hack StyleProvider

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
    api.writeTmpFile({
      path: `runtime.tsx`,
      context: {
        configProvider:
          withConfigProvider && JSON.stringify(api.config.antd.configProvider),
        appConfig:
          appComponentAvailable && JSON.stringify(api.config.antd.appConfig),
        styleProvider: styleProviderConfig,
        // 是否启用了 v5 的 theme algorithm
        enableV5ThemeAlgorithm:
          isV5 && (userInputCompact || userInputDark)
            ? { compact: userInputCompact, dark: userInputDark }
            : false,
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

type AntdConfig = Prettify<{}
{{#withConfigProvider}}  & ConfigProviderProps{{/withConfigProvider}}
{{#withAppConfig}}  & { appConfig: AppConfig }{{/withAppConfig}}
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
