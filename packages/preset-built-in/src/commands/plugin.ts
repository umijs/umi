import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'plugin',
    description: 'inspect umi plugins',
    fn({ args }) {
      const command = args._[0];
      console.log('command', command);

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
        Object.keys(api.service.plugins).forEach((pluginId: string) => {
          const plugin = api.service.plugins[pluginId];
          console.info(`- ${plugin.id}`);
        });
      }
    },
  });
};
