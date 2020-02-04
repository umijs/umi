import mkdirp from 'mkdirp';
import { homedir } from 'os';
import resolveFrom from 'resolve-from';
import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';
import { executeCommand } from './npmClient';

interface IOpts {
  npmClient?: string;
  packageName?: string;
  baseDir?: string;
  onData?: () => {};
}

export default async function(opts: IOpts) {
  const { npmClient = 'npm', packageName = 'create-umi', onData } = opts;

  // 创建目录
  const baseDir = opts.baseDir || join(homedir(), `.umi/creator/${packageName}`);
  mkdirp.sync(baseDir);

  // 创建 package.json
  const pkgPath = join(baseDir, 'package.json');
  if (existsSync(pkgPath)) {
    // 更新
    // 更新时使用安装时用的 npmClient，否则会导致不可预知的问题
    await executeCommand(
      require(pkgPath).npmClient, // eslint-disable-line
      ['update', '--registry=https://registry.npm.taobao.org'],
      baseDir,
      {
        unsafePerm: true,
        onData,
      },
    );
  } else {
    // 写 package.json
    writeFileSync(
      pkgPath,
      JSON.stringify(
        {
          npmClient,
          dependencies: {
            [packageName]: '*',
          },
        },
        null,
        2,
      ),
      'utf-8',
    );
    // 安装依赖
    await executeCommand(
      npmClient,
      ['install', '--registry=https://registry.npm.taobao.org'],
      baseDir,
      {
        unsafePerm: true,
        onData,
      },
    );
  }

  return resolveFrom(baseDir, packageName);
}
