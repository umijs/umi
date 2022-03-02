import { dirname } from 'path';
import { IApi } from 'umi';
import { Mustache, winPath } from 'umi/plugin-utils';

/*
   As long as moment2dayjs is registered, moment will be replaced by dayjs.
   The presets that can adapt to antd is registered by default.
   When the user configures preset and plugins at the same time, we will merge them.
*/
export default (api: IApi) => {
  api.describe({
    key: 'moment2dayjs',
    config: {
      schema(joi) {
        return joi.object({
          preset: joi.string(), // 'antd' | 'antdv3 | 'none'
          plugins: joi.array(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  const presets = {
    antd: [
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
    antdv3: [
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
  };

  const getDayjsPlugins = (api: IApi) => {
    let { preset = 'antd', plugins = [] } = api.config.moment2dayjs || {};

    switch (preset) {
      case 'antd':
        return Array.from(new Set(presets['antd'].concat(plugins)));
      case 'antdv3':
        return Array.from(new Set(presets['antdv3'].concat(plugins)));
      case 'none':
        return [].concat(plugins);
      default:
        return [];
    }
  };

  // replace moment
  api.modifyConfig((memo) => {
    memo.alias.moment = dirname(require.resolve('dayjs/package.json'));
    return memo;
  });

  api.onGenerateFiles(() => {
    const plugins = getDayjsPlugins(api);

    const runtimeTpl = `
import dayjs from '{{{dayjsPath}}}';
import antdPlugin from '{{{dayjsAntdPluginPath}}}';

{{#plugins}}
import {{.}} from '{{{dayjsPath}}}/plugin/{{.}}';
{{/plugins}}

{{#plugins}}
dayjs.extend({{.}});
{{/plugins}}

dayjs.extend(antdPlugin);
    `;
    const dayjsAntdPluginPath = winPath(
      require.resolve('antd-dayjs-webpack-plugin/src/antd-plugin'),
    );
    const dayjsPath = winPath(dirname(require.resolve('dayjs/package.json')));

    api.writeTmpFile({
      path: 'runtime.tsx',
      content: Mustache.render(runtimeTpl, {
        plugins,
        dayjsPath,
        dayjsAntdPluginPath,
      }),
    });
  });

  api.addEntryCodeAhead(() => [`import './plugin-moment2dayjs/runtime.tsx'`]);
};
