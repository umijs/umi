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
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { basename, dirname, extname, join, parse } from 'path';
import { IApi } from '../../types';
import { set as setUmirc } from '../config/set';

export interface IArgsBase {
  fallback?: boolean;
  eject?: boolean;
  _: string[];
}

export interface IArgsPage extends IArgsBase {
  dir?: boolean;
}

export interface IArgsComponent extends IArgsBase {}

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

export interface IFile {
  from: string;
  fromFallback: string;
  to: string;
  exts?: string[];
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
}: {
  filesMap: IFile[];
  baseDir: string;
  presetArgs?: {
    fallback?: boolean;
  };
  templateVars: Record<string, any>;
}) {
  const { fallback } = presetArgs;

  const choosePath = ({ from, fromFallback, exts = [] }: IFile) => {
    if (fallback) {
      return fromFallback;
    }

    if (existsSync(from)) {
      if (
        statSync(from).isDirectory() &&
        readdirSync(from).filter((name) => name !== '.DS_Store').length === 0
      ) {
        return fromFallback;
      }

      return from;
    }

    for (const ext of exts) {
      const fullPath = from + ext;
      if (existsSync(fullPath) && statSync(fullPath).isFile()) {
        return fullPath;
      }
    }

    return fromFallback;
  };
  const names: string[] = [];
  for (const file of filesMap) {
    const { to, fromFallback } = file;
    const fromPath = choosePath(file);

    // keep toPath's ext same with fromPath
    const toPath = statSync(fromPath).isDirectory()
      ? to
      : join(
          dirname(to),
          parse(to).name + extname(fromPath.replace(/\.tpl$/, '')),
        );

    await generateFile({
      path: fromPath,
      target: toPath,
      data: templateVars,
      baseDir,
    });

    if (fromPath !== fromFallback) {
      names.push(basename(to));
    }
  }

  if (names.length > 0) {
    logger.info(`${names.join(', ')} is generated by yourself template.`);
  }
}

export async function tryEject(dir: ETempDir, baseDir: string) {
  const generateBaseDir = join(__dirname, '../../../templates/generate', dir);
  const targetDir = join(baseDir, 'templates', dir);
  const willCopyFiles = readdirSync(generateBaseDir);

  // TODO: support nested files in sub directory
  if (existsSync(targetDir) && statSync(targetDir).isDirectory()) {
    const userExistFiles = readdirSync(targetDir);
    const conflictFiles = willCopyFiles.filter((filename) =>
      userExistFiles.includes(filename),
    );

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
  logger.info(
    `Ejected ${dir} template successfully. More info see: "https://umijs.org/docs/guides/generator#对${
      dir === ETempDir.Page ? '页面' : '组件'
    }模板内容进行自定义`,
  );
}
