import {
  BaseGenerator,
  chalk,
  clackPrompts,
  execa,
  fsExtra,
  getGitInfo,
  installWithNpmClient,
  logger,
  pkgUp,
  tryPaths,
  yParser,
} from '@umijs/utils';
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import gitly from 'gitly';
import { homedir } from 'os';
import { dirname, join } from 'path';
import rimraf from 'rimraf';

interface IArgs extends yParser.Arguments {
  default?: boolean;
  git?: boolean;
  install?: boolean;
}

interface IContext {
  projectRoot: string;
  inMonorepo: boolean;
  target: string;
}

interface ITemplatePluginParams {
  pluginName?: string;
}

interface ITemplateParams extends ITemplatePluginParams {
  version: string;
  npmClient: ENpmClient;
  registry: string;
  author: string;
  email: string;
  withHusky: boolean;
  extraNpmrc: string;
}

enum ENpmClient {
  npm = 'npm',
  cnpm = 'cnpm',
  tnpm = 'tnpm',
  yarn = 'yarn',
  pnpm = 'pnpm',
}

enum ERegistry {
  npm = 'https://registry.npmjs.com/',
  taobao = 'https://registry.npmmirror.com',
}

enum ETemplate {
  app = 'app',
  max = 'max',
  vueApp = 'vue-app',
  plugin = 'plugin',
}

const getTemplatePath = async (appTemplate: ETemplate) => {
  const umiHref = `https://github.com/umijs/umi.git`;
  const gitHref = `https://github.com/umijs/${appTemplate}-template.git`;
  const temporaryTemplatePath = join(process.cwd(), '.umi-create-tmp');
  const umiRepoGlobalPath = join(homedir(), '.umi-repo');
  const localTemplatePath = join(__dirname, '..', 'templates', appTemplate);
  try {
    // 先看看 umi 主仓库的 examples 有没有
    if (existsSync(umiRepoGlobalPath)) {
      spawnSync('git', ['pull'], { cwd: umiRepoGlobalPath });
    } else {
      spawnSync('git', ['clone', '--depth', '1', umiHref, '.'], {
        cwd: umiRepoGlobalPath,
      });
    }
    const examplePath = join(umiRepoGlobalPath, 'examples', appTemplate);
    if (existsSync(examplePath)) {
      console.log(`using umi repo examples/${appTemplate}`);
      return examplePath;
    }

    let [, localPath] = await gitly(gitHref, temporaryTemplatePath, {});
    if (!localPath) {
      console.log(`using local template ${appTemplate}`);
      return localTemplatePath;
    }
    console.log(`using template repo umijs/${appTemplate}-template`);
    return localPath;
  } catch (error) {
    console.log(error);
    return join(__dirname, '..', 'templates', appTemplate);
  }
};

export interface IDefaultData extends ITemplateParams {
  appTemplate?: ETemplate;
}

const pkg = require('../package');
const DEFAULT_DATA = {
  pluginName: 'umi-plugin-demo',
  email: 'i@domain.com',
  author: 'umijs',
  version: pkg.version,
  npmClient: ENpmClient.pnpm,
  registry: ERegistry.npm,
  withHusky: false,
  extraNpmrc: '',
  appTemplate: ETemplate.app,
} satisfies IDefaultData;

interface IGeneratorOpts {
  cwd: string;
  args: IArgs;
  defaultData?: IDefaultData;
}

export default async ({
  cwd,
  args,
  defaultData = DEFAULT_DATA,
}: IGeneratorOpts) => {
  let [name] = args._;
  let npmClient = ENpmClient.pnpm;
  let registry = ERegistry.npm;
  let appTemplate = defaultData?.appTemplate || ETemplate.app;
  const { username, email } = await getGitInfo();
  const author = email && username ? `${username} <${email}>` : '';

  // plugin params
  let pluginName = `umi-plugin-${name || 'demo'}`;

  const { isCancel, text, select, intro, outro } = clackPrompts;
  const exitPrompt = () => {
    outro(chalk.red('Exit create-umi'));
    process.exit(1);
  };

  const useDefaultData = args.default;
  if (!useDefaultData) {
    intro(chalk.bgHex('#19BDD2')(' create-umi '));
    appTemplate = (await select({
      message: 'Pick Umi App Template',
      options: [
        { label: 'Simple App', value: ETemplate.app },
        {
          label: 'Ant Design Pro',
          value: ETemplate.max,
          hint: 'more plugins and ready to use features',
        },
        { label: 'Vue Simple App', value: ETemplate.vueApp },
        {
          label: 'Umi Plugin',
          value: ETemplate.plugin,
          hint: 'for plugin development',
        },
      ],
      initialValue: ETemplate.app,
    })) as ETemplate;
    if (isCancel(appTemplate)) {
      exitPrompt();
    }
    npmClient = (await select({
      message: 'Pick Npm Client',
      options: [
        { label: ENpmClient.npm, value: ENpmClient.npm },
        { label: ENpmClient.cnpm, value: ENpmClient.cnpm },
        { label: ENpmClient.tnpm, value: ENpmClient.tnpm },
        { label: ENpmClient.yarn, value: ENpmClient.yarn },
        { label: ENpmClient.pnpm, value: ENpmClient.pnpm, hint: 'recommended' },
      ],
      initialValue: ENpmClient.pnpm,
    })) as ENpmClient;
    if (isCancel(npmClient)) {
      exitPrompt();
    }
    registry = (await select({
      message: 'Pick Npm Registry',
      options: [
        {
          label: 'npm',
          value: ERegistry.npm,
        },
        {
          label: 'taobao',
          value: ERegistry.taobao,
          hint: 'recommended for China',
        },
      ],
      initialValue: ERegistry.npm,
    })) as ERegistry;
    if (isCancel(registry)) {
      exitPrompt();
    }
    // plugin extra questions
    const isPlugin = appTemplate === ETemplate.plugin;
    if (isPlugin) {
      pluginName = (await text({
        message: `What's the plugin name?`,
        placeholder: pluginName,
        validate: (value) => {
          if (!value?.length) {
            return 'Please input plugin name';
          }
        },
      })) as string;
      if (isCancel(pluginName)) {
        exitPrompt();
      }
    }
    outro(chalk.green(`You're all set!`));
  }

  const target = name ? join(cwd, name) : cwd;

  const version = pkg.version;

  // detect monorepo
  const monorepoRoot = await detectMonorepoRoot({ target });
  const inMonorepo = !!monorepoRoot;
  const projectRoot = inMonorepo ? monorepoRoot : target;

  // git
  const shouldInitGit = args.git !== false;
  // now husky is not supported in monorepo
  const withHusky = shouldInitGit && !inMonorepo;

  const isPnpm = npmClient === ENpmClient.pnpm;

  const templatePath = await getTemplatePath(appTemplate);

  const generator = new BaseGenerator({
    path: templatePath,
    target,
    slient: true,
    data: useDefaultData
      ? defaultData
      : ({
          version: version.includes('-canary.') ? version : `^${version}`,
          npmClient,
          registry,
          author,
          email,
          withHusky,
          // suppress pnpm v7 warning
          // No need when `pnpm` > v7.13.5 , but we are forward compatible
          // https://pnpm.io/npmrc#strict-peer-dependencies
          extraNpmrc: isPnpm ? `strict-peer-dependencies=false` : '',
          pluginName,
        } satisfies ITemplateParams),
  });
  await generator.run();

  // 删除掉临时目录
  if (templatePath.includes('.umi-create-tmp')) {
    await rimraf.sync(templatePath);
  }

  const context: IContext = {
    inMonorepo,
    target,
    projectRoot,
  };

  if (!withHusky) {
    await removeHusky(context);
  }

  if (inMonorepo) {
    // monorepo should move .npmrc to root
    await moveNpmrc(context);
  }

  // init git
  if (shouldInitGit) {
    await initGit(context);
  } else {
    logger.info(`Skip Git init`);
  }

  // install deps
  if (!useDefaultData && args.install !== false) {
    installWithNpmClient({ npmClient, cwd: target });
  } else {
    logger.info(`Skip install deps`);
  }
};

async function detectMonorepoRoot(opts: {
  target: string;
}): Promise<string | null> {
  const { target } = opts;
  const rootPkg = await pkgUp.pkgUp({ cwd: dirname(target) });
  if (!rootPkg) {
    return null;
  }
  const rootDir = dirname(rootPkg);
  if (
    tryPaths([
      join(rootDir, 'lerna.json'),
      join(rootDir, 'pnpm-workspace.yaml'),
    ])
  ) {
    return rootDir;
  }
  return null;
}

async function moveNpmrc(opts: IContext) {
  const { target, projectRoot } = opts;
  const sourceNpmrc = join(target, './.npmrc');
  const targetNpmrc = join(projectRoot, './.npmrc');
  if (!existsSync(targetNpmrc)) {
    await fsExtra.copyFile(sourceNpmrc, targetNpmrc);
  }
  await fsExtra.remove(sourceNpmrc);
}

async function initGit(opts: IContext) {
  const { projectRoot } = opts;
  const isGit = existsSync(join(projectRoot, '.git'));
  if (isGit) return;
  try {
    await execa.execa('git', ['init'], { cwd: projectRoot });
  } catch {
    logger.error(`Initial the git repo failed`);
  }
}

async function removeHusky(opts: IContext) {
  const dir = join(opts.target, './.husky');
  if (existsSync(dir)) {
    await fsExtra.remove(dir);
  }
}
