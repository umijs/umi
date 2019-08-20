import execa from 'execa';

export async function executeCommand(npmClient, args, targetDir, opts = {}) {
  return new Promise((resolve, reject) => {
    args.push('--registry=https://registry.npm.taobao.org');
    const child = execa(npmClient, args, {
      cwd: targetDir,
      stdio: ['inherit', 'pipe', 'pipe'],
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
  const yarnClients = ['yarn', 'ayarn', 'tyarn'];
  const args = yarnClients.includes(npmClient) ? [] : ['install'];
  await executeCommand(npmClient, args, targetDir, opts);
}
