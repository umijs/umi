import { IFlowContext, IAddBlockOption } from '../types';
import installDependencies from '../../../../installDependencies';

const install = async (ctx: IFlowContext, args: IAddBlockOption) => {
  const { logger, execa, api } = ctx;
  const { npmClient, registry } = ctx.stages;

  await installDependencies(
    {
      npmClient,
      registry,
      applyPlugins: api.applyPlugins,
      paths: api.paths,
      debug: api.debug,
      dryRun: args.dryRun,
      spinner: logger,
      skipDependencies: args.skipDependencies,
      execa,
    },
    ctx.stages.blockCtx,
  );
};

export default install;
