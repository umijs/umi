// @ts-ignore
import { lodash, winPath } from '@umijs/utils';
import { existsSync, opendirSync } from 'fs';
import { join } from 'path';
import type { IApi } from 'umi';

const { isEmpty } = lodash;

const mfSetupModuleVirtualPath = '_mf_setup-public-path.js';

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
              entry: Joi.string(),
              entries: Joi.object(),
              keyResolver: Joi.string(),
            }),
          ),
          library: Joi.object(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

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

    let name = '_';

    if (!isEmpty(exposes)) {
      name = mfName();

      addMFEntry(
        config,
        name,
        join(api.paths.absTmpPath, 'plugin-mf', mfSetupModuleVirtualPath),
      );
    }

    const mfConfig = {
      name,
      remotes,
      filename: 'remote.js',
      exposes,
      shared,
      library: api.config.mf.library,
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
    api.writeTmpFile({
      content: `/* infer remote public */;
      __webpack_public_path__ = document.currentScript.src + '/../';`,
      path: mfSetupModuleVirtualPath,
    });

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

      const r = formatRemote(remote);

      if (memo[aliasName]) {
        return api.logger.error(
          `${aliasName} already set as ${memo[aliasName]}, new value ${r} will be ignored`,
        );
      }
      memo[aliasName] = r;
    });

    return memo;
  }

  function formatRemote(remote: any): string {
    const url = remote.entry;

    const mfUrl = `${remote.name}@${url}`;

    if (remote.entry) {
      return mfUrl;
    }

    if (remote.entries && remote.keyResolver) {
      const dynamicUlr = `promise new Promise(resolve => {
  const entries = ${JSON.stringify(remote.entries)};
  const key = ${remote.keyResolver};

  const remoteUrlWithVersion = entries[key];
  const script = document.createElement('script')
  script.src = remoteUrlWithVersion
  script.onload = () => {
    // the injected script has loaded and is available on window
    // we can now resolve this Promise
    const proxy = {
      get: (request) => window.${remote.name}.get(request),
      init: (arg) => {
        try {
          return window.${remote.name}.init(arg)
        } catch(e) {
          console.log('remote container already initialized')
        }
      }
    }
    resolve(proxy)
  }
  // inject this script with the src set to the versioned remoteEntry.js
  document.head.appendChild(script);
})
`;
      return dynamicUlr;
    } else {
      api.logger.error('you should provider entry or entries and keyResolver');
      throw Error('Wrong MF#remotes config');
    }
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

    if (api.config.mf.name) {
      return api.config.mf.name;
    }

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

  function addMFEntry(config: any, mfName: string, path: string) {
    config.entry[mfName] = path;
  }
}
