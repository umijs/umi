import { chalk } from '@umijs/utils';
import assert from 'assert';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.onCheck(async () => {
    // routes
    assert(
      api.appData.routes,
      `routes not found, you may be run umi on the wrong directory.`,
    );

    await api.applyPlugins({
      key: 'onChangePkgJSON',
      args: {
        current: api.appData.pkg,
      },
    });
    await api.applyPlugins({
      key: 'onCheckConfig',
      args: {
        config: api.config,
        userConfig: api.userConfig,
      },
    });
  });

  api.onCheckCode(({ CodeFrameError, ...args }) => {
    args.imports.forEach(({ source, loc }) => {
      // Fixed version import is not allowed
      // e.g. import { X } from '_@ant-design_icons@4.7.0@ant-design/icons'
      if (['cnpm', 'tnpm'].includes(api.appData.npmClient)) {
        if (!isAbsolutePath(source) && /@\d/.test(source)) {
          throw new CodeFrameError(`${source} is not allowed to import.`, loc);
        }
      }

      if (
        !isAbsolutePath(source) &&
        /\/\.umi(-(test|production))?\//.test(source)
      ) {
        const { importSource } = api.appData.umi;
        throw new CodeFrameError(
          `${source} includes /.umi/, /.umi-test/ or /.umi-production/. It's not allowed to import. Please import from ${importSource} or the corresponding plugin.`,
          loc,
        );
      }
    });
  });

  api.onCheckConfig(({ config }) => {
    if (config.publicPath.startsWith('./') && api.env === 'development') {
      console.log(
        `\n${chalk.red(
          `\`publicPath\` does not support start with ${chalk.bold.blue(
            './',
          )} in development environment.`,
        )}
  You should use :
    ${chalk.green(
      `publicPath: process.env.NODE_ENV === 'production' ? './' : '/'`,
    )}
`,
      );
      throw new Error(
        `publicPath can not start with './' in development environment.`,
      );
    }
  });

  // no mock/**
  api.onPrepareBuildSuccess(({ result }) => {
    const imps = Object.keys(result.metafile?.inputs || {}).filter((f) =>
      f.startsWith('mock/'),
    );
    if (imps.length) {
      throw new Error(
        `Detected mock imports from src: ${imps.join(
          ', ',
        )}. \`mock/**\` is not allowed to import.`,
      );
    }
  });

  function isAbsolutePath(path: string) {
    return (
      path.startsWith('/') ||
      path.startsWith('@fs/') ||
      /^[A-Za-z]:\//.test(path) // fix windows path after transform by winPath method
    );
  }
};
