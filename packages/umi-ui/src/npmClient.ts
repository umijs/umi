import execa from 'execa';

const getSpeedUpEnv = (taobaoSpeedUp: boolean) => {
  if (!taobaoSpeedUp) {
    return {};
  }
  const registry = 'https://registry.npm.taobao.org';
  const MIRROR_URL = 'https://npm.taobao.org/mirrors';
  return {
    NODEJS_ORG_MIRROR: `${MIRROR_URL}/node`,
    NVM_NODEJS_ORG_MIRROR: `${MIRROR_URL}/node`,
    NVM_IOJS_ORG_MIRROR: `${MIRROR_URL}/iojs`,
    PHANTOMJS_CDNURL: `${MIRROR_URL}/phantomjs`,
    CHROMEDRIVER_CDNURL: 'http://tnpm-hz.oss-cn-hangzhou.aliyuncs.com/dist/chromedriver',
    OPERADRIVER_CDNURL: `${MIRROR_URL}/operadriver`,
    ELECTRON_MIRROR: `${MIRROR_URL}/electron/`,
    SASS_BINARY_SITE: `${MIRROR_URL}/node-sass`,
    PUPPETEER_DOWNLOAD_HOST: MIRROR_URL,
    FLOW_BINARY_MIRROR: 'https://github.com/facebook/flow/releases/download/v',
    npm_config_registry: registry,
    yarn_registry: registry,
  };
};

export async function executeCommand(npmClient, args, targetDir, opts = { taobaoSpeedUp: true }) {
  const extraEnv = getSpeedUpEnv(opts.taobaoSpeedUp);
  return new Promise((resolve, reject) => {
    // args.push('--registry=https://registry.npm.taobao.org');
    const child = execa(npmClient, args, {
      cwd: targetDir,
      env: {
        ...process.env,
        ...extraEnv,
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
  } else if (['tnpm', 'npm', 'cnpm'].includes(npmClient)) {
    args = ['install', '-d'];
  }

  await executeCommand(npmClient, args, targetDir, opts);
}
