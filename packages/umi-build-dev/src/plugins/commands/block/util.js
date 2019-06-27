import chalk from 'chalk';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import execa from 'execa';
import assert from 'assert';
import ora from 'ora';
import GitUrlParse from 'git-url-parse';
import terminalLink from 'terminal-link';
import inquirer from 'inquirer';
import {
  dependenciesConflictCheck,
  getMockDependencies,
  getAllBlockDependencies,
} from './getBlockGenerator';

/**
 * 判断是不是一个 gitmodules 的仓库
 */
const isSubmodule = templateTmpDirPath => existsSync(join(templateTmpDirPath, '.gitmodules'));

/**
 * 将区块转化为 inquirer 能用的数组
 * @param {*} blocks
 * @returns {[
 *  name:string;
 *  value:string;
 *  key:string;
 * ]} blockArray
 */
export function printBlocks(blocks, hasLink) {
  const blockArray = [];

  const loopBlocks = (blocks, parentPath = '') => {
    blocks.forEach(block => {
      if (block.type === 'block') {
        const blockName = join(parentPath, block.path);

        let name = `📦  ${chalk.cyan(blockName)}  `;
        if (hasLink) {
          // 链接到 pro 的预览界面
          // AccountCenter -> account/center
          const previewPath = blockName
            .match(/[A-Z]?[a-z]+|[0-9]+/g)
            .map(p => p.toLowerCase())
            .join('/');
          const link = terminalLink('预览', `https://preview.pro.ant.design/${previewPath}`);
          // 增加一个预览的界面
          name += link;
        }
        blockArray.push({
          name,
          value: blockName,
          key: blockName,
        });
      }
      if (block.type === 'dir') {
        return loopBlocks(block.blocks, block.path);
      }
      return null;
    });
  };
  loopBlocks(blocks);
  return blockArray;
}

/**
 * 交互型区块选择
 * - 选择区块名
 * - 输入路径
 * - 选择是否转化 js
 * @param {[
 *  name:string;
 *  value:string;
 *  key:string;
 * ]} blockArray
 * @returns Promise<{args}>
 */
export async function selectInstallBlockArgs(blockArray) {
  return new Promise(resolve => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'block',
          message: `⛰  请选择区块（共 ${blockArray.length} 个 )`,
          choices: blockArray,
        },
        { type: 'input', name: 'path', message: '🏗  请输入输出安装区块的路径' },
        {
          type: 'confirm',
          name: 'js',
          message: '🤔  将 Typescript 区块转化为 js?',
          default: false,
        },
      ])
      .then(async ({ block, path, js }) => {
        resolve({ _: ['add', block], path: path || block, js });
      });
  });
}

/**
 * 获取区块列表，默认会从  http://blocks.umijs.org/api/blocks 拉
 * 如果配置 defaultGitUrl ，会从 defaultGitUrl 去找
 * @param {*} _
 * @param {*} blockConfig
 * @param {*} addBlock
 */
export async function getDefaultBlockList(_, blockConfig = {}, addBlock) {
  const spinner = ora();
  const got = require('got');
  let blockArray = [];
  const { defaultGitUrl } = blockConfig;

  spinner.start('🚣 fetch block list');

  // 如果存在 defaultGitUrl 的配置，就从 defaultGitUrl 配置中拿区块列表
  if (defaultGitUrl) {
    const ignoreFile = ['_scripts'];
    const { name, owner } = GitUrlParse(defaultGitUrl);
    spinner.succeed();
    spinner.start(`🔍 find block list form ${chalk.yellow(defaultGitUrl)}`);

    // 一个 github 的 api,可以获得文件树
    const { body } = await got(`https://api.github.com/repos/${owner}/${name}/git/trees/master`);
    const files = JSON.parse(body)
      .tree.filter(file => file.type === 'tree' && !ignoreFile.includes(file.path))
      .map(({ path }) => ({
        type: 'block',
        path,
      }));
    blockArray = printBlocks(files, 'link');
  } else {
    const { body } = await got(`http://blocks.umijs.org/api/blocks`);
    const { status, error, data } = JSON.parse(body);
    if (status === 'success') {
      blockArray = printBlocks(data);
    } else {
      throw new Error(error);
    }
  }

  spinner.succeed();

  if (blockArray.length > 0) {
    const args = await selectInstallBlockArgs(blockArray);
    return addBlock(args);
  }
  return new Error('No block found');
}

/**
 * clone 下来的 git 会缓存。这个方法可以更新缓存
 * @param {*} ctx
 * @param {*} spinner
 */
export async function gitUpdate(ctx, spinner) {
  spinner.start('🚒 Git fetch');
  try {
    await execa(`git`, ['fetch'], {
      cwd: ctx.templateTmpDirPath,
    });
  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }
  spinner.succeed();

  spinner.start(`🚪 Git checkout ${ctx.branch}`);

  try {
    await execa(`git`, ['checkout', ctx.branch], {
      cwd: ctx.templateTmpDirPath,
    });
  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }
  spinner.succeed();

  spinner.start('🚀 Git pull');
  try {
    await execa(`git`, [`pull`], {
      cwd: ctx.templateTmpDirPath,
    });
    // 如果是 git pull 之后有了
    // git module 只能通过这种办法来初始化一下
    if (isSubmodule(ctx.templateTmpDirPath)) {
      // 结束  git pull 的 spinner
      spinner.succeed();

      //如果是分支切换过来，可能没有初始化，初始化一下
      await execa(`git`, ['submodule', 'init'], {
        cwd: ctx.templateTmpDirPath,
        env: process.env,
      });

      spinner.start(`👀 update submodule`);
      await execa(`git`, ['submodule', 'update', '--recursive'], {
        cwd: ctx.templateTmpDirPath,
      });
    }
  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }
  spinner.succeed();
}

/**
 * 克隆区块的地址
 * @param {*} ctx
 * @param {*} spinner
 */
export async function gitClone(ctx, spinner) {
  spinner.start(`🔍 Clone git repo from ${ctx.repo}`);
  try {
    await execa(
      `git`,
      [`clone`, ctx.repo, ctx.id, `--single-branch`, `--recurse-submodules`, `-b`, ctx.branch],
      {
        cwd: ctx.blocksTempPath,
        env: process.env,
      },
    );
  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }
  spinner.succeed();
}
/**
 * 安装依赖包
 * - 获取项目路径
 * - 递归获得依赖项。
 * - 调用 npm 来合并安装依赖项
 * @param {*} param0
 * @param {*} ctx
 */
export async function installDependencies(
  { npmClient, registry, applyPlugins, paths, debug, dryRun, spinner },
  ctx,
) {
  // read project package.json
  const projectPkgPath = applyPlugins('_modifyBlockPackageJSONPath', {
    initialValue: join(paths.cwd, 'package.json'),
  });
  assert(existsSync(projectPkgPath), `No package.json found in your project`);
  // eslint-disable-next-line
  const projectPkg = require(projectPkgPath);

  // get _mock.js dependencie
  let devDependencies = {};
  const mockFilePath = join(ctx.sourcePath, 'src/_mock.js');
  if (existsSync(mockFilePath)) {
    devDependencies = getMockDependencies(readFileSync(mockFilePath, 'utf-8'), ctx.pkg);
  }
  const allBlockDependencies = getAllBlockDependencies(ctx.templateTmpDirPath, ctx.pkg);
  // 构造 _modifyBlockDependencies 的执行参数
  const initialValue = dependenciesConflictCheck(
    allBlockDependencies,
    projectPkg.dependencies,
    devDependencies,
    {
      ...projectPkg.devDependencies,
      ...projectPkg.dependencies,
    },
  );
  // get confilict dependencies and lack dependencies
  const { conflicts, lacks, devConflicts, devLacks } = applyPlugins('_modifyBlockDependencies', {
    initialValue,
  });
  debug(
    `conflictDeps ${conflicts}, lackDeps ${lacks}`,
    `devConflictDeps ${devConflicts}, devLackDeps ${devLacks}`,
  );

  // find confilict dependencies throw error
  const allConflicts = [...conflicts, ...devConflicts];
  const ErrorInfo = allConflicts
    .map(info => {
      return `* ${info[0]}: ${info[2]}(your project) not compatible with ${info[1]}(block)`;
    })
    .join('\n');
  if (allConflicts.length) {
    throw new Error(`find dependencies conflict between block and your project:${ErrorInfo}`);
  }
  // find lack confilict, auto install
  if (dryRun) {
    debug('dryRun is true, skip install dependencies');
  } else {
    if (lacks.length) {
      const deps = lacks.map(dep => `${dep[0]}@${dep[1]}`);
      spinner.start(
        `📦  Install additional dependencies ${deps.join(
          ',',
        )} with ${npmClient} --registry ${registry}`,
      );
      try {
        let npmArgs = npmClient.includes('yarn') ? ['add'] : ['install'];
        npmArgs = [...npmArgs, ...deps, `--registry=${registry}`];

        // 安装区块的时候不需要安装 puppeteer, 因为 yarn 会全量安装一次所有依赖。
        // 加个环境变量规避一下
        await execa(npmClient, npmClient.includes('yarn') ? npmArgs : [...npmArgs, '--save'], {
          cwd: dirname(projectPkgPath),
          env: {
            ...process.env,
            // ref  https://github.com/GoogleChrome/puppeteer/blob/411347cd7bb03edacf0854760712d32b0d9ba68f/docs/api.md#environment-variables
            PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
          },
        });
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();
    }

    if (devLacks.length) {
      // need skip devDependency which already install in dependencies
      const devDeps = devLacks
        .filter(dep => !lacks.find(item => item[0] === dep[0]))
        .map(dep => `${dep[0]}@${dep[1]}`);
      spinner.start(
        `Install additional devDependencies ${devDeps.join(
          ',',
        )} with ${npmClient}  --registry ${registry}`,
      );
      try {
        let npmArgs = npmClient.includes('yarn') ? ['add'] : ['install'];
        npmArgs = [...npmArgs, ...devDeps, `--registry=${registry}`];
        await execa(npmClient, npmClient.includes('yarn') ? npmArgs : [...npmArgs, '--save-dev'], {
          cwd: dirname(projectPkgPath),
        });
      } catch (e) {
        spinner.fail();
        throw new Error(e);
      }
      spinner.succeed();
    }
  }
}
