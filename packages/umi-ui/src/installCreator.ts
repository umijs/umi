import execa from 'execa';
import mkdirp from 'mkdirp';
import userHome from 'user-home';
import resolveFrom from 'resolve-from';
import { join } from 'path';
import { existsSync, writeFileSync } from 'fs';

interface IOpts {
  npmClient?: string;
  packageName?: string;
  baseDir?: string;
}

export async function executeCommand(npmClient, args, targetDir) {
  return new Promise((resolve, reject) => {
    const child = execa(npmClient, args, {
      cwd: targetDir,
      stdio: ['inherit', 'pipe', 'inherit'],
    });
    child.stdout.on('data', buffer => {
      process.stdout.write(buffer);
    });
    child.on('close', code => {
      if (code !== 0) {
        reject(new Error(`command failed: ${npmClient} ${args.join(' ')}`));
        return;
      }
      resolve();
    });
  });
}

export default async function(opts: IOpts) {
  const { npmClient = 'npm', packageName = 'create-umi' } = opts;

  // 创建目录
  const baseDir = opts.baseDir || join(userHome, `.umi/creator/${packageName}`);
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
    );
  }

  return resolveFrom(baseDir, packageName);
}
