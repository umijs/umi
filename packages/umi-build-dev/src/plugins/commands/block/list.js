import inquirer from 'inquirer';
import ora from 'ora';

import { getBlockListFromGit, printBlocks, genBlockName } from './util';
import addBlock from './addBlock';

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
  return new Promise(async resolve => {
    let locale = false;
    const { block, path, js, uni18n } = await inquirer.prompt([
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
      {
        type: 'confirm',
        name: 'uni18n',
        message: '🌎  删除 i18n 代码? ',
        default: false,
      },
    ]);
    if (uni18n) {
      const { region } = await inquirer.prompt([
        {
          type: 'input',
          name: 'region',
          message: '🌎  请输入你的选择的语言? ',
          default: 'zh-CN',
        },
      ]);
      locale = region;
    }

    const blockPath = path || genBlockName(block);

    resolve({
      url: block,
      path: blockPath,
      js,
      uni18n: locale,
    });
  });
}

/**
 * 获取区块列表，默认会从  http://blocks.umijs.org/api/blocks 拉
 * 如果配置 defaultGitUrl ，会从 defaultGitUrl 去找
 * @param {*} _
 * @param {*} blockConfig
 */
async function getDefaultBlockList(_, blockConfig = {}, api) {
  const spinner = ora();
  const got = require('got');
  let blockArray = [];
  const { defaultGitUrl } = blockConfig;

  spinner.start('🚣  fetch block list');

  // 如果存在 defaultGitUrl 的配置，就从 defaultGitUrl 配置中拿区块列表
  if (defaultGitUrl) {
    // 一个 github 的 api,可以获得文件树
    const files = await getBlockListFromGit(defaultGitUrl);
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
    return addBlock(args, {}, api);
  }
  return new Error('No block found');
}

export default getDefaultBlockList;
