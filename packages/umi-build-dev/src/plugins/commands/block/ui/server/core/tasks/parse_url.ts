import assert from 'assert';
import { IApi } from 'umi-types';
import chalk from 'chalk';
import { merge } from 'lodash';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import getNpmRegistry from 'getnpmregistry';

import { IFlowContext, IAddBlockOption, ICtxTypes } from '../types';
import { getParsedData, makeSureMaterialsTempPathExist } from '../../../../download';

async function getCtx(url, args: IAddBlockOption = {}, api: IApi): Promise<ICtxTypes> {
  const { debug, config } = api;
  debug(`get url ${url}`);

  const ctx: ICtxTypes = await getParsedData(url, { ...(config.block || {}), ...args });

  if (!ctx.isLocal) {
    const blocksTempPath = makeSureMaterialsTempPathExist(args.dryRun);
    const templateTmpDirPath = join(blocksTempPath, ctx.id);
    merge(ctx, {
      routePath: args.routePath,
      sourcePath: join(templateTmpDirPath, ctx.path),
      branch: args.branch || ctx.branch,
      templateTmpDirPath,
      blocksTempPath,
      repoExists: existsSync(templateTmpDirPath),
    });
  } else {
    merge(ctx, {
      routePath: args.routePath,
      templateTmpDirPath: dirname(url),
    });
  }
  return ctx;
}

const parseUrl = async (ctx: IFlowContext, args: IAddBlockOption) => {
  const { url } = args;
  ctx.logger.setId(url); // 设置这次 flow 的 log trace id
  ctx.result.blockUrl = url; // 记录当前的 url

  assert(url, `run ${chalk.cyan.underline('umi help block')} to checkout the usage`);
  const { paths, config } = ctx.api;
  const blockConfig: {
    npmClient?: string;
  } = config.block || {};

  const useYarn = existsSync(join(paths.cwd, 'yarn.lock'));
  const defaultNpmClient = blockConfig.npmClient || (useYarn ? 'yarn' : 'npm');
  const registryUrl = await getNpmRegistry();
  const blockCtx = await getCtx(
    url,
    {
      ...args,
      npmClient: args.npmClient || defaultNpmClient,
    },
    ctx.api,
  );

  ctx.stages.blockCtx = blockCtx;
  ctx.stages.registry = args.registry || registryUrl;
};

export default parseUrl;
