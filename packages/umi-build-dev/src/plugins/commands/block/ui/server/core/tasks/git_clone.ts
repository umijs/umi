import { IFlowContext, ICtxTypes } from '../types';

const clone = async (ctx: IFlowContext) => {
  const { logger, execa } = ctx;

  const { repo, id, branch, blocksTempPath } = ctx.stages.blockCtx as ICtxTypes;

  logger.start(`🔍  clone git repo from ${repo}`);

  await execa('git', ['clone', repo, id, '--single-branch', '--recurse-submodules', '-b', branch], {
    cwd: blocksTempPath,
    env: process.env,
  });
  logger.succeed();
};

export default clone;
