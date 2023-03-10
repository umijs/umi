import assert from 'assert';
import { dirname } from 'path';
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

    // appConfig is only available in version 5.2 and above.
    if (antd.appConfig && !appComponentAvailable) {
      api.logger.warn(
        `antd.appConfig is only available in version 5.1.0 and above, but you are using version ${antdVersion}`,
      );
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

  // antd config provider
  api.onGenerateFiles(() => {
    if (!api.config.antd.configProvider) return;
    api.writeTmpFile({
      path: `runtime.tsx`,
      content: Mustache.render(
        `
import React from 'react';
import { ConfigProvider, Modal, message, notification } from 'antd';
import { ApplyPluginsType } from 'umi';
import { getPluginManager } from '../core/plugin';

export function rootContainer(container) {
  const finalConfig = getPluginManager().applyPlugins({
    key: 'antd',
    type: ApplyPluginsType.modify,
    initialValue: {...{{{ config }}}},
  });
  if (finalConfig.prefixCls) {
    Modal.config({
      rootPrefixCls: finalConfig.prefixCls
    });
    message.config({
      prefixCls: \`\${finalConfig.prefixCls}-message\`
    });
    notification.config({
      prefixCls: \`\${finalConfig.prefixCls}-notification\`
    });
  }
  if (finalConfig.iconPrefixCls) {
    // Icons in message need to set iconPrefixCls via ConfigProvider.config()
    ConfigProvider.config({
      iconPrefixCls: finalConfig.iconPrefixCls,
    });
  }
  return <ConfigProvider {...finalConfig}>{container}</ConfigProvider>;
}
      `.trim(),
        {
          config: JSON.stringify(api.config.antd.configProvider),
        },
      ),
    });
  });

  // App component
  api.onGenerateFiles(() => {
    const appComponentIsValid =
      appComponentAvailable && JSON.stringify(api.config.antd.appConfig);

    if (!appComponentIsValid) return;

    api.writeTmpFile({
      path: `appRuntime.tsx`,
      content: Mustache.render(
        `
import React from 'react';
import { App } from 'antd';
import { ApplyPluginsType } from 'umi';
import { getPluginManager } from '../core/plugin';

export function rootContainer(container) {
  const {
    appConfig: finalAppConfig = {},
  } = getPluginManager().applyPlugins({
    key: 'antd',
    type: ApplyPluginsType.modify,
    initialValue: { appConfig: {{{ appConfig }}}},
  });

  return <App {...finalAppConfig}>{container}</App>;;
}
`.trim(),
        {
          appConfig: appComponentIsValid,
        },
      ),
    });
  });

  // runtime type generation
  api.onGenerateFiles(() => {
    const withCpRuntime = !!api.config.antd.configProvider;
    const withAppRuntime =
      appConfigAvailable && JSON.stringify(api.config.antd.appConfig);

    api.writeTmpFile({
      path: 'types.d.ts',
      content: Mustache.render(
        `
{{#withCpRuntime}}
import type { ConfigProviderProps } from 'antd/es/config-provider';
{{/withCpRuntime}}
{{#withAppRuntime}}
import type { AppConfig } from 'antd/es/app/context';
{{/withAppRuntime}}

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type AntdConfig = Prettify<{}
{{#withCpRuntime}}  & ConfigProviderProps{{/withCpRuntime}}
{{#withAppRuntime}}  & { appConfig: AppConfig }{{/withAppRuntime}}
>;

export type RuntimeAntdConfig = (memo: AntdConfig) => AntdConfig;
`.trim(),
        {
          withCpRuntime,
          withAppRuntime,
        },
      ),
    });

    if (withCpRuntime || withAppRuntime) {
      api.writeTmpFile({
        path: RUNTIME_TYPE_FILE_NAME,
        content: `
  import type { RuntimeAntdConfig } from './types.d';
  export type IRuntimeConfig = {
    antd?: RuntimeAntdConfig
  };
        `,
      });
    }
  });

  api.addRuntimePlugin(() => {
    const appComponentIsValid =
      appComponentAvailable && JSON.stringify(api.config.antd.appConfig);

    // appRuntime 一定要在 runtime 之前，因为 antd 的 App 必须在 ConfigProvider 内
    const plugins = [
      appComponentIsValid && withTmpPath({ api, path: 'appRuntime.tsx' }),
      api.config.antd.configProvider &&
        withTmpPath({ api, path: 'runtime.tsx' }),
    ].filter(Boolean);

    return plugins;
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
