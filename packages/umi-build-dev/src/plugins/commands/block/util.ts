import chalk from 'chalk';
import { join } from 'path';
import { existsSync } from 'fs';
import execa from 'execa';
import ora from 'ora';

import GitUrlParse from 'git-url-parse';
import terminalLink from 'terminal-link';
import { getFastGithub } from 'umi-utils';

import { BlockData } from './data.d';
import arrayToTree from './arrayToTree';

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
  const loopBlocks = (blockItems, parentPath = '') => {
    blockItems.forEach(block => {
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

// https://gitee.com/ant-design/pro-blocks/raw/master/AccountCenter/snapshot.png
// https://raw.githubusercontent.com/ant-design/pro-blocks/master/AccountCenter/snapshot.png?raw=true
export const imgFilter = (list, { name, owner }, useGitee) => {
  if (!useGitee) {
    return list;
  }
  return list.map(item => ({
    ...item,
    img: item.img.replace(
      `https://raw.githubusercontent.com/${owner}/${name}/master/`,
      `https://gitee.com/${owner}/${name}/raw/master/`,
    ),
  }));
};

export const getBlockListFromGit = async (gitUrl, useBuiltJSON) => {
  const got = require('got');
  const ignoreFile = ['_scripts', 'tests'];

  const { name, owner, resource } = GitUrlParse(gitUrl);

  if (spinner.isSpinning) {
    spinner.succeed();
  }

  if (useBuiltJSON) {
    const fastGithub = await getFastGithub();
    // use blockList.json in git repo
    const url =
      fastGithub === 'gitee.com'
        ? `https://gitee.com/${owner}/${name}/raw/master/umi-block.json`
        : `https://raw.githubusercontent.com/${owner}/${name}/master/umi-block.json`;

    spinner.start(`🔍  find block list form ${chalk.yellow(url)}`);
    try {
      const { body } = await got(url);
      spinner.succeed();
      // body = {blocks: [], templates: []}
      const data = JSON.parse(body);
      // TODO update format logic
      return imgFilter(
        data.list || data.blocks || data.template,
        {
          name,
          owner,
        },
        fastGithub === 'gitee.com',
      );
    } catch (error) {
      // if file 404
    }
    return [];
  }

  // 如果不是 github 不支持这个方法，返回一个空
  // 可以搞一些约定，下次 下次
  if (resource !== 'github.com') {
    return [];
  }

  // 一个 github 的 api,可以获得文件树
  const url = `https://api.github.com/repos/${owner}/${name}/git/trees/master`;
  spinner.start(`🔍  find block list form ${chalk.yellow(url)}`);
  const { body } = await got(url);
  const filesTree = JSON.parse(body)
    .tree.filter(
      file =>
        file.type === 'tree' && !ignoreFile.includes(file.path) && file.path.indexOf('.') !== 0,
    )
    .map(({ path }) => ({
      url: `${gitUrl}/tree/master/${path}`,
      type: 'block',
      path,
      isPage: true,
      defaultPath: `/${path}`,
      img: `https://github.com/ant-design/pro-blocks/raw/master/${path}/snapshot.png`,
      tags: ['Ant Design Pro'],
      name: path,
      previewUrl: `https://preview.pro.ant.design/${genBlockName(path)}`,
    }));
  spinner.succeed();
  return filesTree;
};

/**
 * clone 下来的 git 会缓存。这个方法可以更新缓存
 * @param {*} ctx
 * @param {*} mySpinner
 */
export async function gitUpdate(ctx, mySpinner) {
  mySpinner.start('🚒  Git fetch');
  try {
    await execa('git', ['fetch'], {
      cwd: ctx.templateTmpDirPath,
      stdio: 'inherit',
    });
  } catch (e) {
    mySpinner.fail();
    throw new Error(e);
  }
  mySpinner.succeed();

  mySpinner.start(`🚛  Git checkout ${ctx.branch}`);

  try {
    await execa('git', ['checkout', ctx.branch], {
      cwd: ctx.templateTmpDirPath,
      stdio: 'inherit',
    });
  } catch (e) {
    mySpinner.fail();
    throw new Error(e);
  }
  mySpinner.succeed();

  mySpinner.start('🚀  Git pull');
  try {
    await execa('git', ['pull'], {
      cwd: ctx.templateTmpDirPath,
      stdio: 'inherit',
    });
    // 如果是 git pull 之后有了
    // git module 只能通过这种办法来初始化一下
    if (isSubmodule(ctx.templateTmpDirPath)) {
      // 结束  git pull 的 spinner
      mySpinner.succeed();

      // 如果是分支切换过来，可能没有初始化，初始化一下
      await execa('git', ['submodule', 'init'], {
        cwd: ctx.templateTmpDirPath,
        env: process.env,
        stdio: 'inherit',
      });

      mySpinner.start('👀  update submodule');
      await execa('git', ['submodule', 'update', '--recursive'], {
        cwd: ctx.templateTmpDirPath,
        stdio: 'inherit',
      });
    }
  } catch (e) {
    mySpinner.fail();
    throw new Error(e);
  }
  mySpinner.succeed();
}

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
export const reduceData = treeData =>
  treeData.reduce((pre, current) => {
    const router = pre[current.key];
    let childrenKeys = {};
    if (current && current.children) {
      childrenKeys = reduceData(current.children);
    }

    if (!router) {
      pre[current.key] = { ...current, children: undefined };
      delete pre[current.key].children;
    }
    return {
      ...pre,
      ...childrenKeys,
    };
  }, {});

/**
 * 克隆区块的地址
 * @param {*} ctx
 * @param {*} mySpinner
 */
export async function gitClone(ctx, mySpinner) {
  mySpinner.start(`🔍  clone git repo from ${ctx.repo}`);
  try {
    await execa('git', ['clone', ctx.repo, ctx.id, '--recurse-submodules'], {
      cwd: ctx.blocksTempPath,
      env: process.env,
      stdio: 'inherit',
    });
  } catch (e) {
    mySpinner.fail();
    throw new Error(e);
  }
  mySpinner.succeed();
}

/**
 * 删除重复的下划线什么的
 * @param path
 */
export const removePrefix = path => path.replace(/\//g, '/').replace(/\/\//g, '/');
/**
 * 增加路由前缀
 * data -> /data
 * @param path
 * @param parentPath
 */
export const addRoutePrefix = (path = '/', parentPath = '/') => {
  if (path.indexOf('/') !== 0) {
    return removePrefix(`${parentPath}/${path}`);
  }
  return path;
};

export const genRouterToTreeData = (routes, path = '/') =>
  routes
    .map(item => {
      const prefixPath = addRoutePrefix(item.path, path);
      if (item.path || item.routes) {
        return {
          title: removePrefix(prefixPath.replace(path, '')) || '/',
          value: prefixPath,
          key: prefixPath,
          children: genRouterToTreeData(item.routes || [], prefixPath),
        };
      }
      return undefined;
    })
    .filter(item => item);

/**
 * 根据 router 来获取  component
 * 用于区块的插入
 * @param {*} routes
 */
export const genComponentToTreeData = (routes, path = '/') =>
  routes
    .map(item => {
      const prefixPath = addRoutePrefix(item.path, path);
      return item.path || item.routes || item.component
        ? {
            title: removePrefix(prefixPath.replace(path, '/')) || '/',
            value: item.component
              ? item.component.replace(/(index)?((\.js?)|(\.tsx?)|(\.jsx?))$/, '')
              : '',
            key: prefixPath,
            children: genComponentToTreeData(item.routes || [], prefixPath),
          }
        : undefined;
    })
    .filter(item => item);

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

/**
 * 获取路由的数据
 * @param {*} routes
 */
export const depthRouterConfig = routerConfig => {
  const getParentKey = (key = '') => {
    const routerKeyArray = key.split('/').filter(routerKey => routerKey);
    routerKeyArray.pop();
    return `/${routerKeyArray.join('/')}`;
  };

  return arrayToTree(
    Object.keys(routerConfig)
      .sort((a, b) => a.split('/').length - b.split('/').length + a.length - b.length)
      .map(key => {
        const parentKey = getParentKey(key);
        return {
          ...routerConfig[key],
          parentKey: parentKey === '/' ? null : parentKey,
        };
      }),
    {
      id: 'key',
      parentId: 'parentKey',
      dataField: null,
    },
  );
};

export interface TreeData {
  title: string;
  value: string;
  key: string;
  children?: TreeData[];
}

/**
 * get BlockList from blockList.json in github repo
 */
export const fetchBlockList = async (repo: string): Promise<BlockData> => {
  try {
    const blocks = await getBlockListFromGit(`https://github.com/${repo}`, true);
    return {
      data: blocks,
      success: true,
    };
  } catch (error) {
    return {
      message: error.message,
      data: undefined,
      success: false,
    };
  }
};

export async function fetchUmiBlock(url) {
  try {
    const got = require('got');
    const { body } = await got(url);
    return {
      data: JSON.parse(body).list,
      success: true,
    };
  } catch (error) {
    return {
      message: error.message,
      data: undefined,
      success: false,
    };
  }
}
