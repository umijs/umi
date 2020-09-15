import { IApi } from '@umijs/types';
import { chalk, lodash } from '@umijs/utils';

export default (api: IApi) => {
  api.registerCommand({
    name: 'plugin',
    description: 'inspect umi plugins',
    details: `
# List plugins
$ umi plugin list

# List plugins with key
$ umi plugin list --key
    `.trim(),
    fn({ args }) {
      const command = args._[0];
      switch (command) {
        case 'list':
          list();
          break;
        default:
          throw new Error(`Unsupported sub command ${command} for umi plugin.`);
      }

      function list() {
        console.log();
        console.log(`  Plugins:`);
        console.log();
        Object.keys(api.service.plugins).forEach((pluginId) => {
          const plugin = api.service.plugins[pluginId];
          const keyStr = args.key
            ? ` ${chalk.blue(`[key: ${[plugin.key]}]`)}`
            : '';
          const isPresetStr = plugin.isPreset
            ? ` ${chalk.green('(preset)')}`
            : '';
          console.log(`    - ${plugin.id}${keyStr}${isPresetStr}`);
        });
        console.log();
      }
    },
  });
};
