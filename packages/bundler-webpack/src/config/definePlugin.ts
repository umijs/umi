import type { HttpsServerOptions } from '@umijs/bundler-utils';
import { DefinePlugin } from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import type { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

interface IResolveDefineOpts {
  define: any;
  publicPath?: string;
  https?: HttpsServerOptions;
}

const prefixRE = /^UMI_APP_/;
const ENV_SHOULD_PASS = ['NODE_ENV', 'HMR', 'SOCKET_SERVER', 'ERROR_OVERLAY'];

// 环境变量传递自定义逻辑，默认直接透传
const EnvGetter: Record<
  string,
  (opts: IResolveDefineOpts) => string | undefined
> = {
  SOCKET_SERVER: (opts: IResolveDefineOpts) => {
    // 如果当前有 process.env.SOCKET_SERVER，则使用当前值
    if (process.env.SOCKET_SERVER) {
      return process.env.SOCKET_SERVER;
    }
    // 如果当前无 process.env.SOCKET_SERVER
    // 则判断是否有 process.env.HOST 且不为 0.0.0.0/127.0.0.1/localhost
    if (
      process.env.HOST &&
      !['0.0.0.0', '127.0.0.1', 'localhost'].includes(process.env.HOST)
    ) {
      const protocol = opts.https ? 'https:' : 'http:';
      return `${protocol}//${process.env.HOST}:${process.env.PORT || 8000}`;
    }
    return;
  },
};

export function resolveDefine(opts: IResolveDefineOpts) {
  const env: Record<string, any> = {};
  // 带 UMI_APP_ 前缀的和 ENV_SHOULD_PASS 定义的环境变量需要透传
  ENV_SHOULD_PASS.concat(
    Object.keys(process.env).filter((k) => prefixRE.test(k)),
  ).forEach((key: string) => {
    const envValue = EnvGetter[key] ? EnvGetter[key](opts) : process.env[key];
    if (typeof envValue === 'undefined') {
      return;
    }
    env[key] = envValue;
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
      https: userConfig.https,
    }),
  ] as any);
}
