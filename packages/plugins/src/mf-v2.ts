import { parseModule } from '@umijs/bundler-utils';
import { chalk, lodash, winPath, zod as z } from '@umijs/utils';
import { existsSync, opendirSync, readFileSync } from 'fs';
import path from 'path';
import { IApi } from 'umi';

const { isEmpty } = lodash;

interface IRemote {
  name: string;
  entry: string;
}

interface IPluginConfig {
  name?: string;
  remotes?: IRemote[];
  shared?: Record<string, any>;
  library?: Record<string, any>;
  remoteHash?: boolean;
  version?: EVersion;
  overrideConfig?: Record<string, any>;
}

enum EEncodeChar {
  AT = '@',
  SLASH = '/',
  HYPHEN = '-',
}

enum ETransformedChar {
  AT = 'scope_',
  SLASH = '__',
  HYPHEN = '_',
}

export enum EVersion {
  v1 = 'v1',
  v2 = 'v2',
}

interface IOptions {
  standalone?: boolean;
}

const NOT_ALLOW_NAME_CHARS = ['.', ':'] as const;
const LOGGER_LABEL = chalk.bold.blue('[module-federation-v2]');

export function configSchema(zod: typeof z) {
  return zod
    .object({
      name: zod.string(),
      remotes: zod.array(
        zod.union([
          zod.object({
            name: zod.string(),
            entry: zod.string(),
            library: zod.record(zod.any()).optional(),
          }),
          zod.record(zod.any()),
        ]),
      ),
      shared: zod.record(zod.any()),
      library: zod.record(zod.any()),
      remoteHash: zod.boolean(),
      version: zod.enum([EVersion.v1, EVersion.v2]),
      overrideConfig: zod.record(zod.any()),
    })
    .partial();
}

export default (api: IApi, options?: IOptions) => {
  const { standalone = true } = options || {};

  if (standalone) {
    api.describe({
      key: 'mfV2',
      enableBy: api.EnableBy.config,
      config: {
        schema({ zod }) {
          return configSchema(zod);
        },
      },
    });
  }

  let bundlerWebpackPath: string | undefined;
  try {
    bundlerWebpackPath = path.dirname(
      require.resolve('@umijs/bundler-webpack/package.json'),
    );
  } catch {}

  api.onStart(() => {
    if (!bundlerWebpackPath) {
      throw new Error(
        `Not found '@umijs/bundler-webpack', please check dependencies`,
      );
    }
    const infoMsg = `Using module federation v2`;
    console.log(`${LOGGER_LABEL} ${chalk.gray(infoMsg)}`);
    process.env.FEDERATION_WEBPACK_PATH = path.join(
      api.paths.absTmpPath,
      `plugin-${api.plugin.key}`,
      'webpack/lib/index.js',
    );
  });

  api.onGenerateFiles(({ isFirstTime }) => {
    if (!isFirstTime || !bundlerWebpackPath) {
      return;
    }

    const webpackPath = path.join(bundlerWebpackPath, 'compiled/webpack');
    const deepImportPath = path.join(webpackPath, 'deepImports.json');
    const deepImports = require(deepImportPath) as string[];

    deepImports.forEach((p) => {
      const content = `
module.exports = require('${p}')
`.trimStart();

      // write file
      api.writeTmpFile({
        path: `${p}.js`,
        content,
      });
    });

    // write webpack entry file
    const entryContent = `module.exports = require('webpack')`;
    api.writeTmpFile({
      path: 'webpack/lib/index.js',
      content: entryContent,
    });
  });

  const getConfig = () => {
    const key = api.plugin.key;
    const config = api.userConfig[key] || api.config[key] || {};
    return config as IPluginConfig;
  };

  const nameTransformUtil = {
    encode: (name: string) => {
      const hasNotAllowChar = NOT_ALLOW_NAME_CHARS.some((char) =>
        name.includes(char),
      );
      if (hasNotAllowChar) {
        throw new Error(
          `module federation name '${name}' contains not allow chars ${NOT_ALLOW_NAME_CHARS.join(
            ',',
          )}`,
        );
      }
      // encode
      if (name.includes(EEncodeChar.AT)) {
        name = name.replaceAll(EEncodeChar.AT, ETransformedChar.AT);
      }
      if (name.includes(EEncodeChar.SLASH)) {
        name = name.replaceAll(EEncodeChar.SLASH, ETransformedChar.SLASH);
      }
      if (name.includes(EEncodeChar.HYPHEN)) {
        name = name.replaceAll(EEncodeChar.HYPHEN, ETransformedChar.HYPHEN);
      }
      return name;
    },
    decode: (name: string) => {
      // decode
      if (name.includes(ETransformedChar.AT)) {
        name = name.replaceAll(ETransformedChar.AT, EEncodeChar.AT);
      }
      if (name.includes(ETransformedChar.SLASH)) {
        name = name.replaceAll(ETransformedChar.SLASH, EEncodeChar.SLASH);
      }
      if (name.includes(ETransformedChar.HYPHEN)) {
        name = name.replaceAll(ETransformedChar.HYPHEN, EEncodeChar.HYPHEN);
      }
      return name;
    },
  };

  const constructExposes = async () => {
    const exposes: Record<string, string> = {};
    const exposesPath = path.join(api.paths.absSrcPath, 'exposes');

    if (!existsSync(exposesPath)) {
      return exposes;
    }

    const dir = opendirSync(exposesPath);
    for await (const dirent of dir) {
      if (dirent.isDirectory()) {
        exposes[`./${dirent.name}`] = winPath(
          path.join(exposesPath, dirent.name),
        );
      } else {
        const warningMsg = `${dirent.name} is not a directory, ignore in ModuleFederation expose`;
        console.log(`${LOGGER_LABEL} ${chalk.yellow(warningMsg)}`);
      }
    }

    return exposes;
  };

  const formatRemotes = (config: IPluginConfig) => {
    const { remotes = [] } = config;

    const memo: Record<string, string> = {};

    remotes.forEach((remote) => {
      const { name, entry } = remote;
      if (!name?.length) {
        const errorMsg = `remote name is required`;
        console.log(`${LOGGER_LABEL} ${chalk.red(errorMsg)}`);
        throw new Error(errorMsg);
      }
      const getName = (): string => {
        const decodedName = nameTransformUtil.decode(name);
        return decodedName;
      };

      const getFormatEntry = (): string => {
        if (entry?.length) {
          const hasAt = entry.includes('@');
          if (hasAt) {
            return entry;
          }
          return `${remote.name}@${entry}`;
        }

        const errorMsg = `you should provider entry for remote ${name}`;
        console.log(`${LOGGER_LABEL} ${chalk.red(errorMsg)}`);
        throw new Error(errorMsg);
      };

      const finalName = getName();
      const finalEntry = getFormatEntry();

      if (memo[finalName]) {
        const errorMsg = `remote ${finalName} is already exists, please check your config`;
        console.log(`${LOGGER_LABEL} ${chalk.red(errorMsg)}`);
        throw new Error(errorMsg);
      }
      memo[finalName] = finalEntry;
    });

    return memo;
  };

  const getShared = (config: IPluginConfig) => {
    const { shared = {} } = config;
    return shared;
  };

  const mfAsyncEntryFileName = 'asyncEntry.ts';
  const getAppEntryFile = () => {
    const entryFile = path.join(
      api.paths.absTmpPath,
      `plugin-${api.plugin.key}`,
      mfAsyncEntryFileName,
    );
    return winPath(entryFile);
  };

  const changeUmiEntry = (config: any) => {
    const { entry } = config;

    const asyncEntryPath = getAppEntryFile();

    if (entry.umi) {
      if (typeof entry.umi === 'string') {
        entry.umi = asyncEntryPath;
      } else if (Array.isArray(entry.umi)) {
        const i = entry.umi.findIndex((f: string) => f.endsWith('umi.ts'));

        if (~i) {
          entry.umi[i] = asyncEntryPath;
        } else {
          const warnMsg = `Not found umi entry in 'entry.umi' ${JSON.stringify(
            entry.umi,
          )}`;
          console.log(`${LOGGER_LABEL} ${chalk.yellow(warnMsg)}`);
        }
      }
    } else {
      const warnMsg = `umi entry not found`;
      console.log(`${LOGGER_LABEL} ${chalk.yellow(warnMsg)}`);
    }
  };

  const getMfName = (config: IPluginConfig) => {
    const name = config.name;
    const packageName = api.pkg.name;
    const finalName = name || packageName;

    if (!finalName?.length) {
      const errorMsg = `module federation name is not defined , please set 'name' in mf config or 'name' in package.json`;
      console.log(`${LOGGER_LABEL} ${chalk.red(errorMsg)}`);
      throw new Error(errorMsg);
    }

    if (!isValidIdentifyName(finalName)) {
      throw new Error(
        `module federation name '${name}' is not valid javascript identifier.`,
      );
    }

    const encodeName = nameTransformUtil.encode(finalName);
    return encodeName;
  };

  api.modifyWebpackConfig(async (config) => {
    const pluginConfig = getConfig();
    const exposes = await constructExposes();
    const remotes = formatRemotes(pluginConfig);
    const shared = getShared(pluginConfig);

    if (isEmpty(remotes) && isEmpty(exposes)) {
      const warnMsg = `ModuleFederation exposes and remotes are empty, plugin will not work`;
      console.log(`${LOGGER_LABEL} ${chalk.yellow(warnMsg)}`);
      return config;
    }

    if (api.env === 'production' || !api.config.mfsu) {
      changeUmiEntry(config);
    }

    const name = getMfName(pluginConfig);

    const useHash =
      typeof pluginConfig.remoteHash === 'boolean'
        ? pluginConfig.remoteHash
        : api.config.hash && api.env !== 'development';

    const mfConfig = {
      name,
      remotes,
      filename: useHash ? 'remote.[contenthash:8].js' : 'remote.js',
      exposes,
      shared,
      library: pluginConfig.library,
      ...(pluginConfig.overrideConfig || {}),
    };

    const checkConfig = () => {
      // config check
      if (api.config.mfsu) {
        console.log(
          `${LOGGER_LABEL} cannot use mfsu with module federation, please disable 'mfsu' in config (e.g. 'mfsu: false')`,
        );
        throw new Error(`mfsu cannot use with module federation`);
      }
      // if export components, check library type
      if (!isEmpty(mfConfig.exposes)) {
        const jsMinifier = api.config.jsMinifier || 'esbuild';
        if (jsMinifier === 'esbuild') {
          // check library type
          const library = pluginConfig.library;
          if (!library?.type) {
            const errorMsg = `mf config 'library.type' is required when not set 'jsMinifier' or use 'esbuild'`;
            const recommandMsg = `please set 'library.type' or use 'jsMinifier: terser' (e.g. 'library: { type: "window", name: "..." }')`;
            const finalMsg = `${errorMsg}, ${recommandMsg}`;
            console.log(`${LOGGER_LABEL} ${chalk.red(finalMsg)}`);
            throw new Error(finalMsg);
          }
        }
      }
    };
    checkConfig();

    const {
      ModuleFederationPlugin,
    } = require('@module-federation/enhanced/webpack');
    config.plugins!.push(new ModuleFederationPlugin(mfConfig));
    api.logger.debug(
      `ModuleFederationPlugin V2 is enabled with config ${JSON.stringify(
        mfConfig,
      )}`,
    );

    return config;
  });

  // write mf async entry file
  api.register({
    key: 'onGenerateFiles',
    stage: 10002,
    fn: async () => {
      const entry = path.join(api.paths.absTmpPath, 'umi.ts');
      const content = readFileSync(entry, 'utf-8');

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
};

export function isValidIdentifyName(name: string) {
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
