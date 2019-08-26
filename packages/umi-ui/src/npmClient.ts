import execa from 'execa';

export async function executeCommand(npmClient, args, targetDir, opts = {}) {
  return new Promise((resolve, reject) => {
    // args.push('--registry=https://registry.npm.taobao.org');
    const child = execa(npmClient, args, {
      cwd: targetDir,
    });
    child.stdout.on('data', buffer => {
      process.stdout.write(buffer);
      if (opts.onData) opts.onData(buffer.toString());
    });
    child.stderr.on('data', buffer => {
      process.stderr.write(buffer);
      if (opts.onData) opts.onData(buffer.toString());
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

export async function installDeps(npmClient, targetDir, opts) {
  let args = [];

  if (['yarn', 'ayarn', 'pnpm'].includes(npmClient)) {
    args = [];
  } else if (['tnpm', 'npm', 'cnpm'].includes(npmClient)) {
    args = ['install', '-d'];
  }

  await executeCommand(npmClient, args, targetDir, opts);
}
