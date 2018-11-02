import { join } from 'path';

export function downloadNpmPackage(url, log) {}

export function downloadFromGit(url, branch = 'master', log) {}

export function isNpmPackage(url) {
  return /^@?([\w\-]+\/?)+$/.test(url);
}

export function isGitUrl(url) {
  return /\.git$/.test(url);
}

const gitSiteParser = /^(https?)\:\/\/((github|gitlab)[\.\w\-]+)\/([\w\-]+)\/([\w\-]+)(\/tree\/([\w\.\-]+)([\w\-\/]+))?$/;
// test is a github or gitlab url
// git site url maybe like: http://gitlab.alitest-inc.com/bigfish/bigfish-materials/tree/master/demo
// or http://gitlab.alitest-inc.com/bigfish/testmaterials/tree/master
// or http://gitlab.alitest-inc.com/bigfish/testmaterials
// or https://github.com/umijs/umi-materials/tree/master/demo
// or https://github.com/alibaba/ice/tree/master/react-materials/blocks/AbilityIntroduction
export function isGitSiteUrl(url) {
  return gitSiteParser.test(url);
}

export function parseGitSiteUrl(url) {
  // (http|s)://(host)/(group)/(name)/tree/(branch)/(path)
  const [
    ,
    protocol,
    host,
    ,
    group,
    name,
    ,
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
