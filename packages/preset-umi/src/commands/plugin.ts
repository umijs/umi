import { chalk } from '@umijs/utils';
import { IApi } from '../types';

export default (api: IApi) => {
  api.describe({
    key: 'command:plugin',
  });

  api.registerCommand({
    name: 'plugin',
    description: 'inspect umi plugins',
    fn({ args }) {
      const command = args._[0];

      if (!command) {
        throw new Error(`
Sub command not found: umi plugin
Did you mean:
  umi plugin list
        `);
      }
      switch (command) {
        case 'list':
          getPluginList();
          break;
        default:
          throw new Error(`Unsupported sub command ${command} for umi plugin.`);
      }
      function getPluginList() {
        const localPlugins = ['./plugin.ts', './plugin.js'];
        Object.keys(api.service.plugins).forEach((pluginId: string) => {
          const plugin = api.service.plugins[pluginId];
          if (localPlugins.includes(plugin.id))
            return console.info(
              `- ${plugin.id} ${chalk.greenBright('(from local)')}`,
            );
          if (plugin.id.startsWith('@umijs/preset'))
            return console.info(
              `- ${plugin.id} ${chalk.cyanBright('(from preset)')}`,
            );
          console.info(`- ${plugin.id}`);
        });
      }
    },
  });
};
