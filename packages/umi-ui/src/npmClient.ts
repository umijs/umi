import spawn from 'cross-spawn';
import BinaryMirrorConfig from 'binary-mirror-config';

const getSpeedUpEnv = () => {
  return BinaryMirrorConfig.china.ENVS;
};

export async function executeCommand(
  npmClient,
  args,
  targetDir,
  opts: {
    unsafePerm: false;
    taobaoSpeedUp: true;
  },
) {
  const extraEnv = getSpeedUpEnv();
  return new Promise((resolve, reject) => {
    // 详细日志
    if (['tnpm', 'npm', 'cnpm'].includes(npmClient)) {
      args.push('-d');
    }
    const child = spawn(npmClient, args, {
      cwd: targetDir,
      env: {
        ...process.env,
        ...extraEnv,
        ...(opts && opts.unsafePerm ? { npm_config_unsafe_perm: true } : {}),
      },
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
  } else if (['tnpm', 'npm', 'cnpm', 'pnpm'].includes(npmClient)) {
    args = ['install'];
  }

  await executeCommand(npmClient, args, targetDir, opts);
}
