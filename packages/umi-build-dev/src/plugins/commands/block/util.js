import chalk from 'chalk';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import execa from 'execa';
import assert from 'assert';

import {
  dependenciesConflictCheck,
  getMockDependencies,
  getAllBlockDependencies,
} from './getBlockGenerator';

/**
 * 判断是不是一个 gitmodules 的仓库
 */
const isSubmodule = templateTmpDirPath => existsSync(join(templateTmpDirPath, '.gitmodules'));

export function printBlocks(blocks, parentPath = '') {
  blocks.forEach(block => {
    if (block.type === 'block') {
      console.log(`    ${chalk.cyan(join(parentPath, block.path))}`);
    }
    if (block.type === 'dir') {
      printBlocks(block.blocks, block.path);
    }
  });
}

export async function getDefaultBlockList() {
  const got = require('got');
  const { body } = await got(`http://blocks.umijs.org/api/blocks`);
  const { status, error, data } = JSON.parse(body);
  if (status === 'success') {
    console.log(``);
    console.log(`  Blocks:`);
    console.log(``);
    printBlocks(data);
    console.log(``);
  } else {
    throw new Error(error);
  }
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
        `Install additional dependencies ${deps.join(
          ',',
        )} with ${npmClient} --registry ${registry}`,
      );
      try {
        let npmArgs = npmClient.includes('yarn') ? ['add'] : ['install'];
        npmArgs = [...npmArgs, ...deps, `--registry=${registry}`];
        await execa(npmClient, npmClient.includes('yarn') ? npmArgs : [...npmArgs, '--save'], {
          cwd: dirname(projectPkgPath),
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
