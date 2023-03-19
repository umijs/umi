import assert from 'assert';
import { dirname, join } from 'path';
import { IApi, RUNTIME_TYPE_FILE_NAME } from 'umi';
import { deepmerge, Mustache, semver } from 'umi/plugin-utils';
import { resolveProjectDep } from './utils/resolveProjectDep';
import { withTmpPath } from './utils/withTmpPath';

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

  // App components exist only from 5.1.0 onwards
  const appComponentAvailable = semver.gte(antdVersion, '5.1.0');
  const appConfigAvailable = semver.gte(antdVersion, '5.3.0');

  api.describe({
    config: {
      schema(Joi) {
        return Joi.alternatives().try(
          Joi.object({
            configProvider: Joi.object(),
            // themes
            dark: Joi.boolean(),
            compact: Joi.boolean(),
            // babel-plugin-import
            import: Joi.boolean(),
            // less or css, default less
            style: Joi.string().allow('less', 'css'),
            theme: Joi.object(),
            // Only antd@5.1.0 is supported
            appConfig: Joi.object(),
          }),
          Joi.boolean().invalid(true),
        );
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

    // moment > dayjs
    if (antd.dayjs) {
      memo.alias.moment = dirname(require.resolve('dayjs/package.json'));
    }

    // antd 5 里面没有变量了，less 跑不起来。注入一份变量至少能跑起来
    if (antdVersion.startsWith('5')) {
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

    // dark mode & compact mode
    if (antd.dark || antd.compact) {
      const { getThemeVariables } = require('antd/dist/theme');
      memo.theme = {
        ...getThemeVariables(antd),
        ...memo.theme,
      };
    }

    // antd theme
    memo.theme = {
      'root-entry-name': 'default',
      ...memo.theme,
    };

    // allow use `antd.theme` as the shortcut of `antd.configProvider.theme`
    if (antd.theme) {
      assert(
        antdVersion.startsWith('5'),
        `antd.theme is only valid when antd is 5`,
      );
      antd.configProvider ??= {};
      // priority: antd.theme > antd.configProvider.theme
      antd.configProvider.theme = deepmerge(
        antd.configProvider.theme || {},
        antd.theme,
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

  // babel-plugin-import
  api.addExtraBabelPlugins(() => {
    // only enable style for non-antd@5
    const style = antdVersion.startsWith('5')
      ? false
      : api.config.antd.style || 'less';

    return api.config.antd.import && !api.appData.vite
      ? [
          [
            require.resolve('babel-plugin-import'),
            {
              libraryName: 'antd',
              libraryDirectory: 'es',
              ...(style
                ? {
                    style: style === 'less' || 'css',
                  }
                : {}),
            },
            'antd',
          ],
        ]
      : [];
  });

  // antd config provider & app component
  api.onGenerateFiles(() => {
    const withConfigProvider = !!api.config.antd.configProvider;
    const withAppConfig = appConfigAvailable && !!api.config.antd.appConfig;

    api.writeTmpFile({
      path: `runtime.tsx`,
      context: {
        configProvider:
          withConfigProvider && JSON.stringify(api.config.antd.configProvider),
        appConfig:
          appComponentAvailable && JSON.stringify(api.config.antd.appConfig),
      },
      tplPath: join(__dirname, '../tpls/antd-runtime.ts.tpl'),
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
      api.config.antd.configProvider ||
      (appComponentAvailable && api.config.antd.appConfig)
    ) {
      return [withTmpPath({ api, path: 'runtime.tsx' })];
    }
    return [];
  });

  // import antd style if antd.import is not configured
  api.addEntryImportsAhead(() => {
    const style = api.config.antd.style || 'less';

    const doNotImportLess =
      (api.config.antd.import && !api.appData.vite) ||
      antdVersion.startsWith('5');

    return doNotImportLess
      ? []
      : [
          {
            source:
              style === 'less' ? 'antd/dist/antd.less' : 'antd/dist/antd.css',
          },
        ];
  });
};
