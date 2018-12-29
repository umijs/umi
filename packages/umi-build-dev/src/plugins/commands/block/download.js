import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import mkdirp from 'mkdirp';

const debug = require('debug')('umi-build-dev:MaterialDownload');

export function makeSureMaterialsTempPathExist(dryRun) {
  const userHome =
    process.env.NODE_ENV === 'test' ? '/Users/test' : require('user-home');
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
      log.log(`dryRun is true, skip git pull`);
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
      log.log(`dryRun is true, skip git clone`);
    } else {
      spawnSync('git', ['clone', url, id, '--single-branch', '-b', branch], {
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
const gitSiteParser = /^(https\:\/\/|http\:\/\/|git\@)((github|gitlab)[\.\w\-]+)(\/|\:)([\w\-]+)\/([\w\-]+)(\/tree\/([\w\.\-]+)([\w\-\/]+))?(.git)?$/;
export function isGitUrl(url) {
  return gitSiteParser.test(url);
}

export function parseGitUrl(url) {
  // (http|s)://(host)/(group)/(name)/tree/(branch)/(path)
  const [
    // eslint-disable-next-line
    all,
    protocol,
    host,
    // eslint-disable-next-line
    site,
    divide, // : or /
    group,
    name,
    // eslint-disable-next-line
    allpath,
    branch = 'master',
    path = '/',
  ] = gitSiteParser.exec(url);
  return {
    repo: `${protocol}${host}${divide}${group}/${name}.git`,
    branch,
    path,
    id: `${host}/${group}/${name}`, // 唯一标识一个 git 仓库
  };
}

export function getParsedData(url) {
  debug(`url: ${url}`);
  let realUrl;
  if (isGitUrl(url)) {
    realUrl = url;
    debug('is git url');
  } else if (/^[\w]+[\w\-\/]*$/.test(url)) {
    realUrl = `https://github.com/umijs/umi-blocks/tree/master/${url}`;
    debug(`will use ${realUrl} as the block url`);
  } else if (/^[\.\/]/.test(url)) {
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
  return parseGitUrl(realUrl);
}
