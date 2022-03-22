import { dirname } from 'path';
import { IApi } from 'umi';
import { Mustache } from 'umi/plugin-utils';
import { resolveProjectDep } from './utils/resolveProjectDep';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  let pkgPath: string;
  try {
    pkgPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'antd',
      }) || dirname(require.resolve('antd/package.json'));
  } catch (e) {}

  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({
          configProvider: Joi.object(),
          // themes
          dark: Joi.boolean(),
          compact: Joi.boolean(),
          // babel-plugin-import
          import: Joi.boolean(),
          // less or css, default less
          style: Joi.string().allow('less', 'css'),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

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

    // antd import
    memo.alias.antd = pkgPath;

    // moment > dayjs
    if (memo.antd.dayjs) {
      memo.alias.moment = dirname(require.resolve('dayjs/package.json'));
    }

    // dark mode & compact mode
    if (memo.antd.dark || memo.antd.compact) {
      const { getThemeVariables } = require('antd/dist/theme');
      memo.theme = {
        ...getThemeVariables(memo.antd),
        ...memo.theme,
      };
    }

    return memo;
  });

  api.modifyConfig((memo) => {
    memo.theme = {
      'root-entry-name': 'default',
      ...memo.theme,
    };
    return memo;
  });

  // babel-plugin-import
  api.addExtraBabelPlugins(() => {
    const style = api.config.antd.style || 'less';
    return api.config.antd.import && !api.appData.vite
      ? [
          [
            require.resolve('babel-plugin-import'),
            {
              libraryName: 'antd',
              libraryDirectory: 'es',
              style: style === 'less' ? true : 'css',
            },
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
import { ConfigProvider, Modal, message, notification } from 'antd';

export function rootContainer(container) {
  const finalConfig = {...{{{ config }}}}
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
  return <ConfigProvider {...finalConfig}>{container}</ConfigProvider>;
}
      `.trim(),
        {
          config: JSON.stringify(api.config.antd.configProvider),
        },
      ),
    });
  });
  api.addRuntimePlugin(() => {
    return api.config.antd.configProvider
      ? [withTmpPath({ api, path: 'runtime.tsx' })]
      : [];
  });

  // import antd style if antd.import is not configured
  api.addEntryImportsAhead(() => {
    const style = api.config.antd.style || 'less';
    return api.config.antd.import && !api.appData.vite
      ? []
      : [
          {
            source:
              style === 'less' ? 'antd/dist/antd.less' : 'antd/dist/antd.css',
          },
        ];
  });
};
