import {
  fsExtra,
  generateFile,
  installWithNpmClient,
  lodash,
  logger,
  prompts,
  semver,
} from '@umijs/utils';
import {
  existsSync,
  readFileSync,
  writeFileSync,
  statSync,
  readdirSync,
} from 'fs';
import { dirname, join } from 'path';
import { IApi } from '../../types';
import { set as setUmirc } from '../config/set';

export type IArgs = {
  fallback?: boolean;
  eject?: boolean;
  dir?: boolean;
  _: string[];
  [k: string]: any;
};

function hasDeps({ name, pkg }: { name: string; pkg: any }) {
  return pkg.dependencies?.[name] || pkg.devDependencies?.[name];
}

export function checkStatus({ pkg }: { pkg: any }) {
  let needInstall = true;
  // 有以下依赖时不需要安装 @umijs/plugins
  if (
    hasDeps({ pkg, name: '@umijs/plugins' }) ||
    hasDeps({ pkg, name: '@umijs/max' }) ||
    hasDeps({ pkg, name: '@alipay/bigfish' })
  ) {
    needInstall = false;
  }

  let needConfigPlugins = true;
  // 有以下依赖时不需要配置依赖
  if (
    hasDeps({ pkg, name: '@umijs/max' }) ||
    hasDeps({ pkg, name: '@alipay/bigfish' })
  ) {
    needConfigPlugins = false;
  }

  return {
    needInstall,
    needConfigPlugins,
  };
}

export class GeneratorHelper {
  private readonly needConfigUmiPlugin: boolean;
  private readonly needInstallUmiPlugin: boolean;

  constructor(readonly api: IApi) {
    const { needInstall, needConfigPlugins } = checkStatus({
      pkg: api.pkg,
    });
    this.needInstallUmiPlugin = needInstall;
    this.needConfigUmiPlugin = needConfigPlugins;
  }

  setUmirc(key: string, val: any) {
    setUmirc(this.api, key, val);
  }

  appendInternalPlugin(pluginPath: string) {
    if (
      this.needConfigUmiPlugin &&
      !(this.api.userConfig.plugins || []).includes(pluginPath)
    ) {
      this.setUmirc(
        'plugins',
        (this.api.userConfig.plugins || []).concat(pluginPath),
      );
    }
  }

  addDevDeps(deps: Record<string, string>) {
    const { api } = this;

    const externalDeps = lodash.omit(deps, ['@umijs/plugins']);

    if (this.needInstallUmiPlugin) {
      api.pkg.devDependencies = {
        ...api.pkg.devDependencies,
        ...deps,
      };
      writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
      logger.info('Write package.json');
    } else if (!lodash.isEmpty(externalDeps)) {
      api.pkg.devDependencies = {
        ...api.pkg.devDependencies,
        ...externalDeps,
      };
      writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
      logger.info('Update package.json for devDependencies');
    }
  }

  addScript(name: string, cmd: string) {
    const { api } = this;

    this.addScriptToPkg(name, cmd);
    writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
    logger.info('Update package.json for scripts');
  }

  addScripts(scripts: { [script: string]: string }) {
    const { api } = this;

    for (const [name, cmd] of Object.entries(scripts)) {
      this.addScriptToPkg(name, cmd);
    }
    writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
    logger.info('Update package.json for scripts');
  }

  private addScriptToPkg(name: string, cmd: string) {
    const { api } = this;

    if (api.pkg.scripts?.[name] && api.pkg.scripts?.[name] !== cmd) {
      logger.warn(
        `scripts.${name} = "${api.pkg.scripts?.[name]}" already exists, will be overwritten with "${cmd}"!`,
      );
    }

    api.pkg.scripts = {
      ...api.pkg.scripts,
      [name]: cmd,
    };
  }

  appendGitIgnore(patterns: string[]) {
    const { api } = this;

    const gitIgnorePath = join(api.cwd, '.gitignore');

    if (existsSync(gitIgnorePath)) {
      const gitIgnore = readFileSync(gitIgnorePath, 'utf-8');
      const toAppendPatterns = patterns.filter(
        (pattern) => !gitIgnore.includes(pattern),
      );

      if (toAppendPatterns.length > 0) {
        const toAppend = patterns.join('\n');

        writeFileSync(gitIgnorePath, `${gitIgnore}\n${toAppend}`);
        logger.info('Update .gitignore');
      }
    }
  }

  installDeps() {
    const { npmClient } = this.api.appData;
    installWithNpmClient({
      npmClient,
    });
    logger.info(`Install dependencies with ${npmClient}`);
  }

  async ensureVariableWithQuestion<V>(
    v: V,
    question: Omit<prompts.PromptObject<'variable'>, 'name'>,
  ) {
    if (!v) {
      const res = await promptsExitWhenCancel({
        ...question,
        name: 'variable',
      });

      return res.variable ? res.variable : question.initial;
    }

    return v;
  }
}

export function getUmiJsPlugin() {
  const pkg = require(join(__dirname, '../../../', 'package.json'));
  const pkgVer = semver.parse(pkg.version);

  const umijsPluginVersion = pkgVer?.prerelease?.length
    ? pkg.version
    : `^${pkg.version}`;
  return umijsPluginVersion;
}

// the definition is copied from prompts.d.ts; if there is a better way to do this, tell me.
export function promptsExitWhenCancel<T extends string = string>(
  questions: prompts.PromptObject<T> | Array<prompts.PromptObject<T>>,
  options?: Pick<prompts.Options, 'onSubmit'>,
): Promise<prompts.Answers<T>> {
  return prompts(questions, {
    ...options,
    onCancel: () => {
      process.exit(1);
    },
  });
}

export function trim(s?: string) {
  return s?.trim() || '';
}

interface IFileMap {
  from: string;
  fromFallback: string;
  to: string;
}

export enum ETempDir {
  Page = 'page',
  Component = 'component',
}

export async function processGenerateFiles({
  filesMap,
  baseDir,
  presetArgs = {},
  templateVars,
  dir = ETempDir.Page,
}: {
  filesMap: IFileMap[];
  baseDir: string;
  presetArgs?: {
    fallback?: boolean;
  };
  templateVars: Record<string, any>;
  dir?: ETempDir;
}) {
  const { fallback } = presetArgs;

  const isChooseUserTemp =
    !fallback &&
    filesMap.every(({ from, fromFallback }) => {
      if (!existsSync(from)) {
        return false;
      }

      if (statSync(from).isFile()) {
        from = dirname(from);
      }

      if (statSync(fromFallback).isFile()) {
        fromFallback = dirname(fromFallback);
      }

      const filesInUserDir = readdirSync(from);
      const filesInUmiDir = readdirSync(fromFallback);

      return filesInUmiDir.every((filename) =>
        filesInUserDir.includes(filename),
      );
    });

  isChooseUserTemp &&
    console.log(`Generated a ${dir} by using yourself template.`);

  for (let { from, to, fromFallback } of filesMap) {
    await generateFile({
      path: isChooseUserTemp ? from : fromFallback,
      target: to,
      data: templateVars,
      baseDir,
    });
  }
}

export async function tryEject(dir: ETempDir, baseDir: string) {
  const generateBaseDir = join(__dirname, '../../../templates/generate', dir);
  const targetDir = join(baseDir, 'templates', dir);
  const readyToCopyFilenames = readdirSync(generateBaseDir);
  const conflictFiles: string[] = [];

  // TODO: support nested files in sub directory
  if (existsSync(targetDir) && statSync(targetDir).isDirectory()) {
    const userExistFiles = readdirSync(targetDir);

    for (let filename of readyToCopyFilenames) {
      if (userExistFiles.includes(filename)) {
        conflictFiles.push(filename);
      }
    }

    if (conflictFiles.length > 0) {
      const response = await prompts({
        type: 'confirm',
        name: 'value',
        message: `Will overwrites ${conflictFiles.join(
          ', ',
        )} in /templates/${dir}, do you want continue ?`,
        initial: false,
      });

      if (!response.value) {
        return;
      }
    }
  }

  fsExtra.ensureDirSync(targetDir);
  fsExtra.copySync(generateBaseDir, targetDir);
  console.log(
    `Ejected ${dir} template successfully. More info see: "https://umijs.org/docs/guides/generator#对${
      dir === ETempDir.Page ? '页面' : '组件'
    }模板内容进行自定义`,
  );
}
