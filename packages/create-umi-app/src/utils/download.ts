import fs from 'fs';
import path from 'path';
import { mkdirp, rimraf, chalk, glob, retry, sortPackage } from '@umijs/utils';
import prettier from '@umijs/deps/reexported/prettier';
import { downloadAndExtractRepo, getRepoInfo } from './examples';

export class DownloadError extends Error {}

export function globList(patternList: any[], options: any) {
  let fileList = [] as any;
  patternList.forEach((pattern) => {
    fileList = [...fileList, ...glob.sync(pattern, options)];
  });

  return fileList;
}

export const filterPkg = (pkgObject: Object = {}, ignoreList: any[] = []) => {
  const devObj = {};
  Object.keys(pkgObject).forEach((key) => {
    const isIgnore = ignoreList.some((reg) => {
      return new RegExp(reg).test(key);
    });
    if (isIgnore) {
      return;
    }
    devObj[key] = pkgObject[key];
  });
  return devObj;
};

export default async function download(
  base: string,
  temp: {
    name: string;
    url: string;
    path: string;
  },
) {
  const { url: gitUrl, path: pathUrl, name } = temp;
  const projectPath = path.join(base, name);

  const root = path.resolve(projectPath);

  const envOptions = {
    cwd: projectPath,
  };

  console.log(`Creating a new Templates in ${chalk.green(root)}.`);
  console.log();
  mkdirp.sync(root);
  process.chdir(root);
  let repoUrl = new URL(gitUrl);
  if (repoUrl.origin !== 'https://github.com') {
    console.error(
      `Invalid URL: ${chalk.red(
        `${gitUrl}/${pathUrl}`,
      )}. Only GitHub repositories are supported. Please use a GitHub URL and try again.`,
    );
    throw new Error(
      `Invalid URL: ${gitUrl}/${pathUrl}. Only GitHub repositories are supported. Please use a GitHub URL and try again.`,
    );
  }
  let repoInfo = await getRepoInfo(repoUrl, pathUrl);

  try {
    if (repoInfo) {
      const repoInfo2 = repoInfo;
      console.log(
        `Downloading files from repo ${chalk.cyan(
          `${gitUrl}/${pathUrl}`,
        )}. This might take a moment.`,
      );
      console.log('');
      await retry(() => downloadAndExtractRepo(root, repoInfo2), {
        retries: 3,
      });
      const packageJsonPath = path.join(root, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        console.log(`${packageJsonPath} is no find`);
        return;
      }
      const pkg = require(packageJsonPath);
      console.log();
      // gen package.json
      if (pkg['create-umi']) {
        const { ignoreScript = [], ignoreDependencies = [] } =
          pkg['create-umi'];
        // filter scripts and devDependencies
        const projectPkg = {
          ...pkg,
          scripts: filterPkg(pkg.scripts, ignoreScript),
          devDependencies: filterPkg(pkg.devDependencies, ignoreDependencies),
        };
        // remove create-umi config
        // delete projectPkg["create-umi"];
        fs.writeFileSync(
          path.resolve(projectPath, 'package.json'),
          // 删除一个包之后 json会多了一些空行。sortPackage 可以删除掉并且排序
          // prettier 会容忍一个空行
          prettier.format(JSON.stringify(sortPackage(projectPkg)), {
            parser: 'json',
          }),
        );
      }
      // Clean up useless files
      if (pkg['create-umi'] && pkg['create-umi'].ignore) {
        console.log('Clean up...');
        const ignoreFiles = pkg['create-umi'].ignore;
        const fileList = globList(ignoreFiles, envOptions);

        fileList.forEach((filePath: string) => {
          const targetPath = path.resolve(projectPath, filePath);
          rimraf.sync(targetPath);
          console.log(`Remove ${targetPath} Success!`);
        });
        console.log(`Download ${gitUrl} Success!`);
      }
      return { ...pkg, temp };
    }
  } catch (reason) {
    throw new DownloadError(reason);
  }
}
