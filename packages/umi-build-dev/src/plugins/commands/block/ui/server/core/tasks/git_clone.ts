import { IFlowContext, ICtxTypes } from '../types';

const clone = async (ctx: IFlowContext) => {
  const { logger, execa } = ctx;
  const { repo, id, blocksTempPath, repoExists } = ctx.stages.blockCtx as ICtxTypes;
  if (repoExists) {
    return;
  }

  logger.appendLog(`🚚  Start git clone from ${repo}`);
  await execa('git', ['clone', repo, id, '--recurse-submodules'], {
    cwd: blocksTempPath,
    env: process.env,
  });
  logger.appendLog('🎉  Success git clone\n');
};

export default clone;
