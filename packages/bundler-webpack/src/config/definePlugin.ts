import { DefinePlugin } from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import type { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  host?: string;
  port?: number;
}

const prefixRE = /^UMI_APP_/;
const ENV_SHOULD_PASS = ['NODE_ENV', 'HMR', 'SOCKET_SERVER', 'ERROR_OVERLAY'];
const SOCKET_IGNORE_HOSTS = ['0.0.0.0', '127.0.0.1', 'localhost'];
// 环境变量传递自定义逻辑，默认直接透传
const CUSTOM_ENV_GETTER: Record<string, (opts: IOpts) => string | undefined> = {
  SOCKET_SERVER: (opts: IOpts) => {
    const { userConfig, host, port } = opts;
    const socketServer = process.env.SOCKET_SERVER;
    // 如果当前有 process.env.SOCKET_SERVER，则使用当前值
    if (socketServer) {
      return socketServer;
    }
    // 如果当前无 process.env.SOCKET_SERVER
    // 则判断是否有 process.env.HOST 且不为 0.0.0.0/127.0.0.1/localhost
    if (host && !SOCKET_IGNORE_HOSTS.includes(host)) {
      const protocol = userConfig.https ? 'https:' : 'http:';
      return `${protocol}//${host}:${port || 8000}`;
    }
    return;
  },
};

export function resolveDefine(opts: IOpts) {
  const { userConfig } = opts;
  const env: Record<string, any> = {};
  // 带 UMI_APP_ 前缀的和 ENV_SHOULD_PASS 定义的环境变量需要透传
  ENV_SHOULD_PASS.concat(
    Object.keys(process.env).filter((k) => prefixRE.test(k)),
  ).forEach((key: string) => {
    const envValue = CUSTOM_ENV_GETTER[key]
      ? CUSTOM_ENV_GETTER[key](opts)
      : process.env[key];
    if (typeof envValue === 'undefined') {
      return;
    }
    env[key] = envValue;
  });

  // Useful for resolving the correct path to static assets in `public`.
  // For example, <img src={process.env.PUBLIC_PATH + '/img/logo.png'} />.
  env.PUBLIC_PATH = userConfig.publicPath || '/';

  for (const key in env) {
    env[key] = JSON.stringify(env[key]);
  }

  const define: Record<string, any> = {};
  if (userConfig.define) {
    for (const key in userConfig.define) {
      define[key] = JSON.stringify(userConfig.define[key]);
    }
  }

  return {
    'process.env': env,
    'process.env.SSR_MANIFEST': 'process.env.SSR_MANIFEST',
    ...define,
  };
}

export async function addDefinePlugin(opts: IOpts) {
  const { config } = opts;
  config.plugin('define').use(DefinePlugin, [resolveDefine(opts)] as any);
}
