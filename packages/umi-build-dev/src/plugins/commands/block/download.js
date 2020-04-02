import { join, resolve } from 'path';
import { existsSync } from 'fs';
import spawn from 'cross-spawn';
import mkdirp from 'mkdirp';
import { homedir } from 'os';
import GitUrlParse from 'git-url-parse';
import { getFastGithub } from 'umi-utils';

const debug = require('debug')('umi-build-dev:MaterialDownload');

const spawnSync = spawn.sync;

export function makeSureMaterialsTempPathExist(dryRun) {
  const userHome = process.env.NODE_ENV === 'test' ? '/Users/test' : homedir();
  const blocksTempPath = join(userHome, '.umi/blocks');
  if (dryRun) {
    return blocksTempPath;
  }
  if (!existsSync(blocksTempPath)) {
    debug(`mkdir blocksTempPath ${blocksTempPath}`);
    mkdirp.sync(blocksTempPath);
  }
  return blocksTempPath;
}

export function downloadFromGit(url, id, branch = 'master', log, args = {}) {
  const { dryRun } = args;
  const blocksTempPath = makeSureMaterialsTempPathExist(dryRun);
  const templateTmpDirPath = join(blocksTempPath, id);

  if (existsSync(templateTmpDirPath)) {
    // git repo already exist, pull it
    // cd id && git pull
    log.info(`${url} exist in cache, start pull from git to update...`);
    if (dryRun) {
      log.log('dryRun is true, skip git pull');
    } else {
      spawnSync('git', ['fetch'], {
        cwd: templateTmpDirPath,
      });
      spawnSync('git', ['checkout', branch], {
        cwd: templateTmpDirPath,
      });
      spawnSync('git', ['pull'], {
        cwd: templateTmpDirPath,
      });
    }
  } else {
    // new git repo, clone
    // git clone url id
    log.info(`start clone code from ${url}...`);
    if (dryRun) {
      log.log('dryRun is true, skip git clone');
    } else {
      spawnSync('git', ['clone', url, id, '-b', branch], {
        cwd: blocksTempPath,
      });
    }
  }
  log.info(`code download to ${templateTmpDirPath}`);
  return templateTmpDirPath;
}

// git site url maybe like: http://gitlab.alitest-inc.com/bigfish/bigfish-blocks/tree/master/demo
// or http://gitlab.alitest-inc.com/bigfish/testblocks/tree/master
// or http://gitlab.alitest-inc.com/bigfish/testblocks
// or https://github.com/umijs/umi-blocks/tree/master/demo
// or https://github.com/alibaba/ice/tree/master/react-blocks/blocks/AbilityIntroduction
const gitSiteParser = /^(https\:\/\/|http\:\/\/|git\@)((github|gitlab)[\.\w\-]+|(?:(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))(\/|\:)([\w\-]+)\/([\w\-]+)(\/tree\/([\w\.\-]+)([\w\-\/]+))?(.git)?$/;
export function isGitUrl(url) {
  return gitSiteParser.test(url);
}

/**
 * gitlab 不加 .git 会将用户重定向到登录
 * @param {*} url
 */
export const urlAddGit = url => {
  if (/\.git$/.test(url)) {
    return url;
  }
  return `${url}.git`;
};

/**
 * 使用 antd@3 的模板和区块
 * @param {*} ref
 */
const getAntdVersion = ref => {
  try {
    const { version } = require('antd');
    if (version.startsWith(3) && ref === 'master') {
      return 'antd@3';
    }
  } catch (error) {
    // return ref;
  }

  if (process.env.BLOCK_REPO_BRANCH) {
    return process.env.BLOCK_REPO_BRANCH;
  }
  if (ref === 'master' || !ref) {
    return 'umi@2';
  }
  return ref;
};

export async function parseGitUrl(url, closeFastGithub) {
  const args = GitUrlParse(url);
  const { ref, filepath, branch, resource, full_name: fullName } = args;
  const fastGithub = await getFastGithub();

  // 如果是 github 并且 autoFastGithub =true 使用
  // 因为自动转化只支持 github 也可以需要关掉
  const repo =
    resource === 'github.com' && !closeFastGithub
      ? args.toString().replace(`${resource}`, fastGithub)
      : args.toString();

  return {
    repo: urlAddGit(repo),
    branch: getAntdVersion(ref) || 'master',
    path: `/${filepath}`,
    id: `${resource}/${fullName}`, // 唯一标识一个 git 仓库
  };
}

export async function getParsedData(url, blockConfig) {
  debug(`url: ${url}`);
  let realUrl;
  const defaultGitUrl = blockConfig.defaultGitUrl || 'https://github.com/umijs/umi-blocks';
  if (isGitUrl(url)) {
    realUrl = url;
    debug('is git url');
  } else if (/^[\w]+[\w\-\/]*$/.test(url)) {
    realUrl = `${defaultGitUrl}/tree/master/${url}`;
    debug(`will use ${realUrl} as the block url`);
  } else if (/^[\.\/]|^[c-zC-Z]:/.test(url)) {
    // ^[c-zC-Z]:  目的是为了支持window下的绝对路径，比如 `C:\\Project\\umi`
    // locale path for test
    const sourcePath = resolve(process.cwd(), url);
    debug(`will use ${sourcePath} as the block url`);
    return {
      isLocal: true,
      sourcePath,
    };
  } else {
    throw new Error(`${url} can't match any pattern`);
  }
  const args = await parseGitUrl(realUrl, blockConfig.closeFastGithub);
  return args;
}
