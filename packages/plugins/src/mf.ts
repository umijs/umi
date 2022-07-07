import { lodash, winPath } from '@umijs/utils';
import { existsSync, opendirSync } from 'fs';
import { join } from 'path';
import type { IApi } from 'umi';

const { isEmpty } = lodash;

export default function mf(api: IApi) {
  api.describe({
    key: 'mf',
    config: {
      schema(Joi) {
        return Joi.object({
          name: Joi.string(),
          fieldName: Joi.string().default('name'),
          remotes: Joi.array().items(
            Joi.object({
              aliasName: Joi.string(),
              name: Joi.string().required(),
              entry: Joi.string().required(),
            }),
          ),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  if (!api.userConfig.mf) {
    api.logger.debug('mf plugin is disabled');
    return;
  }

  api.modifyWebpackConfig(async (config, { webpack }) => {
    const exposes = await constructExposes();
    const remotes = formatRemotes();
    const shared = mergeSharedConfig();

    // @ts-ignore
    if (isEmpty(remotes) && isEmpty(exposes)) {
      api.logger.warn(
        'ModuleFederation exposes and remotes are empty, plugin will not work',
      );
      return config;
    }

    if (!isEmpty(remotes)) {
      if (!(api.env === 'development' && api.config.mfsu)) {
        changeUmiEntry(config);
      }
    }

    if (!isEmpty(exposes)) {
      // fixme  to support runtimePublicPath
      // @ts-ignore
      config.output.publicPath = 'auto';
    }

    const mfConfig = {
      name: mfName(),
      remotes,
      filename: 'remote.js',
      exposes,
      shared,
      // todo 加入lib
    };

    const { ModuleFederationPlugin } = webpack.container;
    // @ts-ignore
    config.plugins.push(new ModuleFederationPlugin(mfConfig));
    api.logger.debug(
      `ModuleFederationPlugin is enabled with config ${JSON.stringify(
        mfConfig,
      )}`,
    );

    return config;
  });

  api.onGenerateFiles(() => {
    if (api.env === 'development' && api.config.mfsu) {
      // skip mfsu already dynamic import
      return;
    }

    api.writeTmpFile({
      noPluginDir: true,
      content: `import('${winPath(join(api.paths.absTmpPath, 'umi.ts'))}')`,
      path: 'asyncEntry.ts',
    });
  });

  function formatRemotes() {
    const { remotes = [] } = api.config.mf;

    const memo: Record<string, string> = {};

    remotes.forEach((remote: any) => {
      const aliasName = remote.aliasName || remote.name;

      const url = remote.entry;

      const mfUrl = `${remote.name}@${url}`;

      if (memo[aliasName]) {
        return api.logger.error(
          `${aliasName} already set as ${memo[aliasName]}, new value is ${mfUrl} will be ignored`,
        );
      }
      memo[aliasName] = mfUrl;
    });

    return memo;
  }

  async function constructExposes() {
    const exposes: any = {};
    const exposesPath = join(api.paths.absSrcPath, 'exposes');

    if (!existsSync(exposesPath)) {
      return exposes;
    }

    const dir = opendirSync(exposesPath);
    for await (const dirent of dir) {
      if (dirent.isDirectory()) {
        exposes['./' + dirent.name] = `./src/exposes/${dirent.name}`;
      } else {
        api.logger.warn(
          `${dirent.name} is not a directory, ignore in ModuleFederation expose`,
        );
      }
    }
    return exposes;
  }

  function mfName() {
    const field = api.config.mf.nameField || 'name';

    if (!api.pkg[field]) {
      api.logger.warn(
        `module federation name is not defined in package.json field: "${field}", "unNamedMF" will be used`,
      );
    }

    return api.pkg[field] || 'unNamedMF';
  }

  function mergeSharedConfig() {
    const { shared = {} } = api.config.mf;
    return {
      react: {
        singleton: true,
        eager: true,
      },
      'react-dom': {
        singleton: true,
        eager: true,
      },
      ...shared,
    };
  }

  function changeUmiEntry(config: any) {
    const { entry } = config;

    if (entry.umi) {
      if (typeof entry.umi === 'string') {
        entry.umi = winPath(join(api.paths.absTmpPath, 'asyncEntry.ts'));
      } else if (Array.isArray(entry.umi)) {
        const i = entry.umi.findIndex((f: string) => f.endsWith('umi.ts'));

        if (i >= 0) {
          entry.umi[i] = winPath(join(api.paths.absTmpPath, 'asyncEntry.ts'));
        } else {
          api.logger.info(
            `umi.ts not found in entry.umi ${JSON.stringify(entry.umi)}`,
          );
        }
      }
    } else {
      api.logger.warn('umi entry not found');
    }
  }
}
