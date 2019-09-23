import chalk from 'chalk';
import { join } from 'path';
import { existsSync } from 'fs';
import execa from 'execa';
import ora from 'ora';
import GitUrlParse from 'git-url-parse';
import terminalLink from 'terminal-link';

/**
 * 全局使用的 loading
 */
const spinner = ora();

/**
 * 判断是不是一个 gitmodules 的仓库
 */
const isSubmodule = templateTmpDirPath => existsSync(join(templateTmpDirPath, '.gitmodules'));

/**
 * * 预览专用 *
 * 从文件数组映射为 pro 的路由
 * @param {*} name
 */
export const genBlockName = name =>
  name
    .match(/[A-Z]?[a-z]+|[0-9]+/g)
    .map(p => p.toLowerCase())
    .join('/');

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
        const { previewUrl } = block;
        let name = `📦  ${chalk.cyan(blockName)}  `;
        if (hasLink) {
          // 链接到 pro 的预览界面
          // AccountCenter -> account/center
          const link = terminalLink('预览', `https://preview.pro.ant.design/${previewUrl}`);
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

export const getBlockListFromGit = async gitUrl => {
  const got = require('got');
  const ignoreFile = ['_scripts', 'tests'];
  const { name, owner } = GitUrlParse(gitUrl);
  spinner.succeed();
  spinner.start(`🔍  find block list form ${chalk.yellow(gitUrl)}`);

  // 一个 github 的 api,可以获得文件树
  const { body } = await got(`https://api.github.com/repos/${owner}/${name}/git/trees/master`);
  const files = JSON.parse(body)
    .tree.filter(file => file.type === 'tree' && !ignoreFile.includes(file.path))
    .map(({ path }) => {
      return {
        type: 'block',
        path,
        isPage: true,
        defaultPath: `/${path}`,
        img: `https://github.com/ant-design/pro-blocks/raw/master/${path}/snapshot.png`,
        tags: ['Ant Design Pro'],
        name: path,
        previewUrl: `https://preview.pro.ant.design/${genBlockName(path)}`,
      };
    });
  spinner.succeed();
  return files;
};

/**
 * clone 下来的 git 会缓存。这个方法可以更新缓存
 * @param {*} ctx
 * @param {*} spinner
 */
export async function gitUpdate(ctx, spinner) {
  spinner.start('🚒  Git fetch');
  try {
    await execa(`git`, ['fetch'], {
      cwd: ctx.templateTmpDirPath,
    });
  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }
  spinner.succeed();

  spinner.start(`🚛  Git checkout ${ctx.branch}`);

  try {
    await execa(`git`, ['checkout', ctx.branch], {
      cwd: ctx.templateTmpDirPath,
    });
  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }
  spinner.succeed();

  spinner.start('🚀  Git pull');
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

      spinner.start(`👀  update submodule`);
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
  spinner.start(`🔍  clone git repo from ${ctx.repo}`);
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
