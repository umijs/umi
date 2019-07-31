import execa from 'execa';

export async function executeCommand(npmClient, args, targetDir) {
  return new Promise((resolve, reject) => {
    args.push('--registry=https://registry.npm.taobao.org');
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

export async function installDeps(npmClient, targetDir) {
  const yarnClients = ['yarn', 'ayarn', 'tyarn'];
  const args = yarnClients.includes(npmClient) ? [] : ['install'];
  await executeCommand(npmClient, args, targetDir);
}
