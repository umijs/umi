import { Mustache, resolve, winPath } from '@umijs/utils';
import { ConfigProviderProps } from 'antd/es/config-provider';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi } from 'umi';

interface IDayJsOpts {
  preset?: string; // 'antd' | 'antdv3'
  plugins?: string[];
  replaceMoment?: boolean;
}

interface IAntdOpts {
  dark?: boolean;
  compact?: boolean;
  dayjs?: boolean | IDayJsOpts;
  config?: ConfigProviderProps;
}

const presets = {
  antd: {
    plugins: [
      'isSameOrBefore',
      'isSameOrAfter',
      'advancedFormat',
      'customParseFormat',
      'weekday',
      'weekYear',
      'weekOfYear',
      'isMoment',
      'localeData',
      'localizedFormat',
    ],
    replaceMoment: true,
  },
  antdv3: {
    plugins: [
      'isSameOrBefore',
      'isSameOrAfter',
      'advancedFormat',
      'customParseFormat',
      'weekday',
      'weekYear',
      'weekOfYear',
      'isMoment',
      'localeData',
      'localizedFormat',
      'badMutable',
    ],
    replaceMoment: true,
  },
} as any;

const getConfig = (api: IApi) => {
  let {
    preset = 'antd',
    plugins,
    replaceMoment,
  } = api.userConfig.antdDayjs || {};

  if (preset && presets[preset]) {
    plugins = presets[preset].plugins;
    replaceMoment = presets[preset].replaceMoment;
  }
  if (plugins) plugins = plugins;
  if (replaceMoment !== undefined) replaceMoment = replaceMoment;
  return {
    plugins,
    replaceMoment,
  };
};

const DIR_NAME = 'plugin-antd';

export default (api: IApi) => {
  const opts: IAntdOpts = api.userConfig.antd;
  // dayjs (by default)
  const { dayjs = true } = opts;
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({
          dark: Joi.boolean(),
          compact: Joi.boolean(),
          config: Joi.object(),
          dayjs: Joi.alternatives(
            Joi.boolean(),
            Joi.object({
              preset: Joi.string(), // 'antd' | 'antdv3'
              plugins: Joi.array(),
              replaceMoment: Joi.boolean(),
            }),
          ),
        });
      },
    },
  });
  // antd import
  // TODO: use api.modifyConfig for support with vite
  api.chainWebpack((memo) => {
    function getUserLibDir({ library }: { library: string }) {
      if (
        // @ts-ignore
        (api.pkg.dependencies && api.pkg.dependencies[library]) ||
        // @ts-ignore
        (api.pkg.devDependencies && api.pkg.devDependencies[library]) ||
        // egg project using `clientDependencies` in ali tnpm
        // @ts-ignore
        (api.pkg.clientDependencies && api.pkg.clientDependencies[library])
      ) {
        return winPath(
          dirname(
            // 通过 resolve 往上找，可支持 lerna 仓库
            // lerna 仓库如果用 yarn workspace 的依赖不一定在 node_modules，可能被提到根目录，并且没有 link
            resolve.sync(`${library}/package.json`, {
              basedir: api.paths.cwd,
            }),
          ),
        );
      }
      return null;
    }
    memo.resolve.alias.set(
      'antd',
      getUserLibDir({ library: 'antd' }) ||
        dirname(require.resolve('antd/package.json')),
    );
    if (dayjs !== false) {
      const { replaceMoment } = getConfig(api);
      if (replaceMoment) {
        memo.resolve.alias.set(
          'moment',
          getUserLibDir({ library: 'dayjs' }) ||
            dirname(require.resolve('dayjs/package.json')),
        );
      }
    }
    return memo;
  });
  // dark mode
  // compat mode
  if (opts?.dark || opts?.compact) {
    // support dark mode, user use antd 4 by default
    const { getThemeVariables } = require('antd/dist/theme');
    api.modifyDefaultConfig((config) => {
      config.theme = {
        ...getThemeVariables(opts),
        ...config.theme,
      };
      return config;
    });
  }
  if (dayjs !== false) {
    api.onGenerateFiles({
      fn: () => {
        const { plugins } = getConfig(api);

        const runtimeTpl = readFileSync(
          join(__dirname, '../templates/antd/dayjs.tpl'),
          'utf-8',
        );
        api.writeTmpFile({
          path: 'plugin-antd/dayjs.tsx',
          content: Mustache.render(runtimeTpl, {
            plugins,
            dayjsPath: dirname(require.resolve('dayjs/package.json')),
            dayjsPluginPath: dirname(
              require.resolve('antd-dayjs-webpack-plugin/package.json'),
            ),
          }),
        });
      },
    });
    api.addEntryCodeAhead(() => {
      return [`import './${DIR_NAME}/dayjs.tsx'`];
    });
  }
  // babel-plugin-import
  api.addExtraBabelPlugins(() => {
    return [
      [
        require.resolve('babel-plugin-import'),
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true,
        },
      ],
    ];
  });
  // antd config provider
  // TODO: use umi provider
  if (opts?.config) {
    api.onGenerateFiles({
      fn() {
        // runtime.tsx
        const runtimeTpl = readFileSync(
          join(__dirname, '../templates/antd/runtime.tpl'),
          'utf-8',
        );
        api.writeTmpFile({
          path: `${DIR_NAME}/runtime.tsx`,
          content: Mustache.render(runtimeTpl, {
            config: JSON.stringify(opts?.config),
          }),
        });
      },
    });
    //TODO：Runtime Plugin
    api.addRuntimePlugin(() => [
      join(api.paths.absTmpPath!, DIR_NAME, 'runtime.tsx'),
    ]);
  }
};
