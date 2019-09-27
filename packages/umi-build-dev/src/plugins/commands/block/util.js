import chalk from 'chalk';
import { join } from 'path';
import { existsSync } from 'fs';
import execa from 'execa';
import ora from 'ora';
import GitUrlParse from 'git-url-parse';
import terminalLink from 'terminal-link';

import { getFastGithub } from 'umi-utils';

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
  const { name, owner, resource } = GitUrlParse(gitUrl);

  if (spinner.isSpinning) {
    spinner.succeed();
  }
  spinner.start(`🔍  find block list form ${chalk.yellow(gitUrl)}`);

  // 满足这个条件，说明是 github 的 pro-block 的仓库，直接使用仓库中生成的代码
  if (name === 'pro-blocks' && owner === 'ant-design' && resource === 'github.com') {
    const fastGithub = await getFastGithub();
    let url = 'https://raw.githubusercontent.com/ant-design/pro-blocks/master/blockList.json';
    if (fastGithub === 'gitee.com') {
      url = 'https://gitee.com/ant-design/pro-blocks/raw/master/blockList.json';
    }
    const { body } = await got(url);
    spinner.succeed();
    return JSON.parse(body);
  }

  // 如果不是 github 不支持这个方法，返回一个空
  // 可以搞一些约定，下次 下次
  if (resource !== 'github.com') {
    return [];
  }

  // 一个 github 的 api,可以获得文件树
  const { body } = await got(`https://api.github.com/repos/${owner}/${name}/git/trees/master`);
  const filesTree = JSON.parse(body)
    .tree.filter(
      file =>
        file.type === 'tree' && !ignoreFile.includes(file.path) && file.path.indexOf('.') !== 0,
    )
    .map(({ path }) => {
      return {
        url: `${gitUrl}/tree/master/${path}`,
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
  return filesTree;
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
      stdio: 'inherit',
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
      stdio: 'inherit',
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
      stdio: 'inherit',
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
        stdio: 'inherit',
      });

      spinner.start(`👀  update submodule`);
      await execa(`git`, ['submodule', 'update', '--recursive'], {
        cwd: ctx.templateTmpDirPath,
        stdio: 'inherit',
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
        stdio: 'inherit',
      },
    );
  } catch (e) {
    spinner.fail();
    throw new Error(e);
  }
  spinner.succeed();
}

export const genRouterToTreeData = routes =>
  routes
    .map(item =>
      item.path || item.routes
        ? {
            title: item.path,
            value: item.path,
            key: item.path,
            children: genRouterToTreeData(item.routes || []),
          }
        : undefined,
    )
    .filter(item => item);

/**
 * 打平 children
 * {
 *    path:"/user",
 *    children:[{ path: "/user/list" }]
 *  }
 *  --->
 *  /user /user/list
 * @param treeData
 */
const reduceData = treeData =>
  treeData.reduce((pre, current) => {
    const router = pre[current.key];
    let childrenKeys = {};
    if (current && current.children) {
      childrenKeys = reduceData(current.children);
    }

    if (!router) {
      pre[current.key] = current;
    }

    return {
      ...pre,
      ...childrenKeys,
    };
  }, {});

/**
 *  转化一下
 *  /user /user/list /user/list/item
 *  ---->
 *  {
 *    path:"/user",
 *    children:[{ path: "/user/list" }]
 *  }
 * @param routes
 */
export const depthRouterConfig = routes => {
  const routerConfig = reduceData(genRouterToTreeData(routes));
  /**
   * 这里可以拼接可以减少一次循环
   */
  return (
    Object.keys(routerConfig)
      .sort((a, b) => a.split('/').length - b.split('/').length + a.length - b.length)
      .map(key => {
        key
          .split('/')
          .filter(routerKey => routerKey)
          .forEach((_, index, array) => {
            const routerKey = array.slice(0, index + 1).join('/');
            if (routerKey.includes('/')) {
              delete routerConfig[`/${routerKey}`];
            }
          });
        return routerConfig[key];
      })
      // 删除没有 children 的数据
      .filter(item => item)
  );
};

/**
 * 判断路由是否存在
 * @param {*} path string
 * @param {*} routes
 */
export function routeExists(path, routes = []) {
  const routerConfig = reduceData(genRouterToTreeData(routes));
  if (routerConfig[path]) {
    return true;
  }
  return false;
}
