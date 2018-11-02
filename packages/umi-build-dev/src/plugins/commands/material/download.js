import { join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'child_process';

const userHome = require('user-home');
const materailsTempPath = join(userHome, '.umi-materials');

export function downloadNpmPackage(url, log) {
  // TODO support
  log(`${url} is a npm package, not support now.`);
}

export function getDirNameByUrl(url) {
  return url.replace(/\//g);
}

export function downloadFromGit(url, branch = 'master', log) {
  const dirName = getDirNameByUrl(url);
  const templateTmpDirPath = join(materailsTempPath, dirName);
  if (existsSync(templateTmpDirPath)) {
    // git repo already exist, pull it
    // cd dirName && git pull
  } else {
    // new git repo, clone
    // git clone url dirName
  }
  // git checkout branch
  // TODO
}

export function isNpmPackage(url) {
  return /^@?([\w\-]+\/?)+$/.test(url);
}

export function isGitUrl(url) {
  return /\.git$/.test(url);
}

// git site url maybe like: http://gitlab.alitest-inc.com/bigfish/bigfish-materials/tree/master/demo
// or http://gitlab.alitest-inc.com/bigfish/testmaterials/tree/master
// or http://gitlab.alitest-inc.com/bigfish/testmaterials
// or https://github.com/umijs/umi-materials/tree/master/demo
// or https://github.com/alibaba/ice/tree/master/react-materials/blocks/AbilityIntroduction
const gitSiteParser = /^(https?)\:\/\/((github|gitlab)[\.\w\-]+)\/([\w\-]+)\/([\w\-]+)(\/tree\/([\w\.\-]+)([\w\-\/]+))?$/;
export function isGitSiteUrl(url) {
  return gitSiteParser.test(url);
}

export function parseGitSiteUrl(url) {
  // (http|s)://(host)/(group)/(name)/tree/(branch)/(path)
  const [
    // eslint-disable-next-line
    all,
    protocol,
    host,
    // eslint-disable-next-line
    site,
    group,
    name,
    // eslint-disable-next-line
    allpath,
    branch = 'master',
    path = '/',
  ] = gitSiteParser.exec(url);
  return {
    repo: `${protocol}://${host}/${group}/${name}.git`,
    branch,
    path,
  };
}

// get code local path by http url or npm package name
export function getPathWithUrl(url, log) {
  if (isNpmPackage(url)) {
    log(`checked ${url} is a npm package.`);
    return downloadNpmPackage(url, log);
  } else if (isGitUrl(url)) {
    log(`checked ${url} is a git repo url.`);
    // TODO suuport change branch
    return downloadFromGit(url, 'master', log);
  } else if (isGitSiteUrl(url)) {
    log(`checked ${url} is a git site url.`);
    const { repo, branch, path } = parseGitSiteUrl(url);
    log(`url parsed, get repo: ${repo}, branch: ${branch}, path: ${path}`);
    const localPath = downloadFromGit(repo, branch);
    return join(localPath, path);
  } else {
    throw new Error(`${url} can't match any Pattern`);
  }
}
