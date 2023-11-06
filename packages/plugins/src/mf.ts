import { parseModule } from '@umijs/bundler-utils';
import { existsSync, opendirSync, readFileSync } from 'fs';
import { join } from 'path';
import type { IApi } from 'umi';
import { lodash, winPath } from 'umi/plugin-utils';
import { TEMPLATES_DIR } from './constants';
import { toRemotesCodeString } from './utils/mfUtils';

const { isEmpty } = lodash;

const mfSetupPathFileName = '_mf_setup-public-path.js';
const mfAsyncEntryFileName = 'asyncEntry.ts';
const MF_TEMPLATES_DIR = join(TEMPLATES_DIR, 'mf');

export default function mf(api: IApi) {
  api.describe({
    key: 'mf',
    config: {
      schema({ zod }) {
        return zod
          .object({
            name: zod.string(),
            remotes: zod.array(
              zod.object({
                aliasName: zod.string().optional(),
                //  string 上没有 required
                name: zod.string(),
                entry: zod.string().optional(),
                entries: zod.object({}).optional(),
                keyResolver: zod.string().optional(),
              }),
            ),
            shared: zod.record(zod.any()),
            library: zod.record(zod.any()),
            remoteHash: zod.boolean(),
          })
          .partial();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyWebpackConfig(async (config, { webpack }) => {
    const exposes = await constructExposes();
    const remotes = formatRemotes();
    const shared = getShared();

    // @ts-ignore
    if (isEmpty(remotes) && isEmpty(exposes)) {
      api.logger.warn(
        'ModuleFederation exposes and remotes are empty, plugin will not work',
      );
      return config;
    }

    if (!isEmpty(remotes)) {
      if (api.env === 'production' || !api.config.mfsu) {
        changeUmiEntry(config);
      }
    }

    let name = '_';

    if (!isEmpty(exposes)) {
      name = mfName();

      addMFEntry(
        config,
        name,
        join(api.paths.absTmpPath, 'plugin-mf', mfSetupPathFileName),
      );
    }

    const useHash =
      typeof api.config.mf.remoteHash === 'boolean'
        ? api.config.mf.remoteHash
        : api.config.hash && api.env !== 'development';

    const mfConfig = {
      name,
      remotes,
      filename: useHash ? 'remote.[contenthash:8].js' : 'remote.js',
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

  api.modifyDefaultConfig(async (memo) => {
    if (memo.mfsu) {
      const exposes = await constructExposes();
      if (!isEmpty(exposes)) {
        memo.mfsu.remoteName = mfName();
        // to avoid module name conflict with host default name
        memo.mfsu.mfName = `mf_${memo.mfsu.remoteName}`;
      }
      const remotes = formatRemotes();
      memo.mfsu.remoteAliases = Object.keys(remotes);

      memo.mfsu.shared = getShared();
    }

    return memo;
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      // ref https://webpack.js.org/concepts/module-federation/#infer-publicpath-from-script
      content: `/* infer remote public */;
      __webpack_public_path__ = document.currentScript.src + '/../';`,
      path: mfSetupPathFileName,
    });

    const { remotes = [] } = api.config.mf;

    api.writeTmpFile({
      path: 'index.tsx',
      context: {
        remoteCodeString: toRemotesCodeString(remotes),
      },
      tplPath: winPath(join(MF_TEMPLATES_DIR, 'runtime.ts.tpl')),
    });
  });

  api.register({
    key: 'onGenerateFiles',
    // ensure after generate tpm files
    stage: 10001,
    fn: async () => {
      if (api.env === 'development' && api.config.mfsu) {
        // skip mfsu already dynamic import
        return;
      }

      const entry = join(api.paths.absTmpPath, 'umi.ts');
      const content = readFileSync(
        join(api.paths.absTmpPath, 'umi.ts'),
        'utf-8',
      );

      const [_imports, exports] = await parseModule({ content, path: entry });

      const mfEntryContent: string[] = [];
      let hasDefaultExport = false;
      if (exports.length) {
        mfEntryContent.push(
          `const umiExports = await import('${winPath(entry)}')`,
        );
        for (const exportName of exports) {
          if (exportName === 'default') {
            hasDefaultExport = true;
            mfEntryContent.push(`export default umiExports.${exportName}`);
          } else {
            mfEntryContent.push(
              `export const ${exportName} = umiExports.${exportName}`,
            );
          }
        }
      } else {
        mfEntryContent.push(`import('${winPath(entry)}')`);
      }
      if (!hasDefaultExport) {
        mfEntryContent.push('export default 1');
      }

      api.writeTmpFile({
        content: mfEntryContent.join('\n'),
        path: mfAsyncEntryFileName,
      });
    },
  });

  function formatRemotes() {
    const { remotes = [] } = api.userConfig.mf;

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
    if (remote.entry) {
      return `${remote.name}@${remote.entry}`;
    }

    if (remote.entries && remote.keyResolver) {
      const dynamicUrl = `promise new Promise(resolve => {
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
      return dynamicUrl;
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
        exposes['./' + dirent.name] = winPath(
          join(api.paths.absSrcPath, 'exposes', dirent.name),
        );
      } else {
        api.logger.warn(
          `${dirent.name} is not a directory, ignore in ModuleFederation expose`,
        );
      }
    }

    return exposes;
  }

  function mfName() {
    const name = api.userConfig.mf.name;

    if (!name) {
      api.logger.warn(
        `module federation name is not defined , "unNamedMF" will be used`,
      );
    }

    if (!isValidIdentifyName(name)) {
      throw new Error(
        `module federation name '${name}' is not valid javascript identifier.`,
      );
    }

    return name || 'unNamedMF';
  }

  function getShared() {
    const { shared = {} } = api.userConfig.mf;
    return shared;
  }

  function changeUmiEntry(config: any) {
    const { entry } = config;

    const asyncEntryPath = winPath(
      join(api.paths.absTmpPath, 'plugin-mf', mfAsyncEntryFileName),
    );

    if (entry.umi) {
      if (typeof entry.umi === 'string') {
        entry.umi = asyncEntryPath;
      } else if (Array.isArray(entry.umi)) {
        const i = entry.umi.findIndex((f: string) => f.endsWith('umi.ts'));

        if (i >= 0) {
          entry.umi[i] = asyncEntryPath;
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

  function isValidIdentifyName(name: string) {
    const reservedKeywords = [
      'abstract',
      'await',
      'boolean',
      'break',
      'byte',
      'case',
      'catch',
      'char',
      'class',
      'const',
      'continue',
      'debugger',
      'default',
      'delete',
      'do',
      'double',
      'else',
      'enum',
      'export',
      'extends',
      'false',
      'final',
      'finally',
      'float',
      'for',
      'function',
      'goto',
      'if',
      'implements',
      'import',
      'in',
      'instanceof',
      'int',
      'interface',
      'let',
      'long',
      'native',
      'new',
      'null',
      'package',
      'private',
      'protected',
      'public',
      'return',
      'short',
      'static',
      'super',
      'switch',
      'synchronized',
      'this',
      'throw',
      'transient',
      'true',
      'try',
      'typeof',
      'var',
      'void',
      'volatile',
      'while',
      'with',
      'yield',
    ];
    // 匹配合法的标识符，但是不能检查保留字
    // Copy from https://github.com/tc39/proposal-regexp-unicode-property-escapes#other-examples
    const regexIdentifierName =
      /^(?:[$_\p{ID_Start}])(?:[$_\u200C\u200D\p{ID_Continue}])*$/u;
    if (reservedKeywords.includes(name) || !regexIdentifierName.test(name)) {
      return false;
    }
    return true;
  }
}
