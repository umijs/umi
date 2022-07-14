import { DefinePlugin } from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

const prefixRE = /^UMI_APP_/;
const ENV_SHOULD_PASS = ['NODE_ENV', 'HMR', 'SOCKET_SERVER', 'ERROR_OVERLAY'];

export function resolveDefine(opts: { define: any; publicPath?: string }) {
  const env: Record<string, any> = {};
  Object.keys(process.env).forEach((key) => {
    if (prefixRE.test(key) || ENV_SHOULD_PASS.includes(key)) {
      env[key] = process.env[key];
    }
  });

  // Useful for resolving the correct path to static assets in `public`.
  // For example, <img src={process.env.PUBLIC_PATH + '/img/logo.png'} />.
  env.PUBLIC_PATH = opts.publicPath || '/';

  for (const key in env) {
    env[key] = JSON.stringify(env[key]);
  }

  const define: Record<string, any> = {};
  if (opts.define) {
    for (const key in opts.define) {
      define[key] = JSON.stringify(opts.define[key]);
    }
  }

  return {
    'process.env': env,
    ...define,
  };
}

export async function addDefinePlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  config.plugin('define').use(DefinePlugin, [
    resolveDefine({
      define: userConfig.define || {},
      publicPath: userConfig.publicPath,
    }),
  ] as any);
}
