import { getConfig } from '@umijs/bundler-webpack';
import { MFSU_NAME } from '@umijs/bundler-webpack/dist/constants';
import { Env } from '@umijs/bundler-webpack/dist/types';
import { DEFAULT_MF_NAME, MF_DEP_PREFIX } from '@umijs/mfsu';
import { lodash, logger, setNoDeprecation } from '@umijs/utils';
import { dirname, join, resolve } from 'path';
import { isMainThread, parentPort } from 'worker_threads';
import { DepBuilderInWorker } from './depBuilder';
import { getDevConfig } from './getConfig';

interface IWorkerData {
  args?: Record<string, any>;
  deps?: any[];
}

if (isMainThread) {
  throw Error('MFSU-eager builder can only be called in a worker thread');
}

// Prevent deprecated warnings in Worker
setNoDeprecation();
setupWorkerEnv();
const argsPromise = setupArgsPromise();

const bundlerWebpackPath = dirname(require.resolve('@umijs/bundler-webpack'));

const bufferedRequest: any = [];

async function start() {
  let builder: DepBuilderInWorker | null = null;

  function build(deps: any[]) {
    logger.info('[MFSU][eager] build worker start to build');

    return builder!.build({ deps }).catch((e) => {
      logger.error('[MFSU][eager] build worker failed', e);
      parentPort!.postMessage({ error: e });
    });
  }

  function scheduleBuild() {
    if (builder && !builder.isBuilding) {
      const buildReq = bufferedRequest.shift();

      if (buildReq) {
        build(buildReq).finally(() => {
          scheduleBuild();
        });
      }
    }
  }

  // 启动一个 Service 的成本比较高(2-3秒), 所以 worker 中的 build 通过 message 来驱动, 以此来复用 service.
  parentPort!.on('message', ({ deps: buildReq }: IWorkerData) => {
    if (Array.isArray(buildReq)) {
      bufferedRequest.push(buildReq);
      scheduleBuild();
    }
  });

  const start = Date.now();

  const args = await argsPromise;
  const opts: any = await getDevConfig(args);

  const cacheDirectoryPath = resolve(
    opts.rootDir || opts.cwd,
    opts.config.cacheDirectoryPath || 'node_modules/.cache',
  );

  const depConfig = await getConfig({
    cwd: opts.cwd,
    rootDir: opts.rootDir,
    env: Env.development,
    entry: opts.entry,
    userConfig: opts.config,
    hash: true,
    staticPathPrefix: MF_DEP_PREFIX,
    name: MFSU_NAME,
    chainWebpack: opts.config.mfsu?.chainWebpack,
    extraBabelIncludes: opts.config.extraBabelIncludes,
    cache: {
      buildDependencies: opts.cache?.buildDependencies,
      cacheDirectory: join(cacheDirectoryPath, 'mfsu-deps'),
    },
    pkg: opts.pkg,
  });

  // TODO: REMOVE ME
  depConfig.resolve!.alias ||= {};
  ['@umijs/utils/compiled/strip-ansi', 'react-error-overlay'].forEach((dep) => {
    // @ts-ignore
    depConfig.resolve.alias[dep] = require.resolve(dep, {
      paths: [bundlerWebpackPath],
    });
  });

  const depEsBuildConfig = {
    extraPostCSSPlugins: opts.config?.extraPostCSSPlugins || [],
    define: lodash.mapValues(opts.config?.define, (v) => JSON.stringify(v)),
  };

  const tmpBase =
    opts.config.mfsu?.cacheDirectory || join(cacheDirectoryPath, 'mfsu');

  const externals = makeArray(opts.config.externals || []);

  builder = new DepBuilderInWorker({
    depConfig,
    cwd: opts.cwd,
    tmpBase,
    mfName: opts.config.mfsu?.mfName || DEFAULT_MF_NAME,
    shared: opts.config.mfsu?.shared || {},
    buildDepWithESBuild: !!opts.config.mfsu?.esbuild,
    depEsBuildConfig,
    externals,
  });
  logger.info(`[MFSU][eager] worker init, takes ${Date.now() - start}ms`);

  scheduleBuild();
}

start().catch((e) => {
  logger.error('[MFSU][eager] build worker start failed', e);
});

function makeArray(a: any) {
  if (Array.isArray(a)) return a;
  return [a];
}

function setupWorkerEnv() {
  // worker 不启用 DID_YOU_KNOW
  process.env.DID_YOU_KNOW = 'none';
  // 此环境变量用于插件判断运行环境, 如果有次变量不去启动一些服务
  process.env.IS_UMI_BUILD_WORKER = 'true';
}

function setupArgsPromise() {
  return new Promise<Record<string, any>>((resolve) => {
    parentPort!.on('message', ({ args }: IWorkerData) => {
      if (args) {
        resolve(args);
      }
    });
  });
}
