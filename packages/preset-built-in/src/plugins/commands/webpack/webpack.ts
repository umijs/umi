import { IApi } from '@umijs/types';
import assert from 'assert';
import { inspect } from 'util';
import { getBundleAndConfigs } from '../buildDevUtils';

export default (api: IApi) => {
  api.registerCommand({
    name: 'webpack',
    description: 'inspect webpack configurations',
    async fn() {
      const { bundleConfigs } = await getBundleAndConfigs({ api });

      let config = bundleConfigs.filter((bundleConfig: any) => {
        return bundleConfig.entry?.umi;
      })[0];
      assert(config, `No valid config found with umi entry.`);

      if (api.args.rule) {
        config = config.module.rules.find(
          (r: any) => r.__ruleNames[0] === api.args.rule,
        );
      } else if (api.args.plugin) {
        config = config.plugins.find(
          (p: any) => p.__pluginName === api.args.plugin,
        );
      } else if (api.args.rules) {
        config = config.module.rules.map((r: any) => r.__ruleNames[0]);
      } else if (api.args.plugins) {
        config = config.plugins.map(
          (p: any) => p.__pluginName || p.constructor.name,
        );
      }

      if (api.args.print !== false) {
        // print object with util.inspect
        // ref: https://stackoverflow.com/questions/10729276/how-can-i-get-the-full-object-in-node-jss-console-log-rather-than-object
        console.log(inspect(config, false, null, true));
      }
      return config;
    },
  });
};
