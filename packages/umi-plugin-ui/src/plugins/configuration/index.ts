import { IApi } from 'umi-types';

export default function(api: IApi) {
  function getConfig() {
    const { userConfig } = (api as any).service;
    const config = userConfig.getConfig({ force: true });
    return userConfig.plugins
      .filter(p => p.type)
      .map(p => {
        if (p.name in config) {
          p.value = config[p.name];
        }
        return Object.keys(p).reduce((memo, key) => {
          if (
            ['name', 'default', 'group', 'type', 'choices', 'description', 'value'].includes(key)
          ) {
            memo[key] = p[key];
          }
          return memo;
        }, {});
      });
  }

  api.addUIPlugin(require.resolve('./dist/ui.umd'));

  api.onUISocket(({ action, success }) => {
    const { type, payload } = action;
    switch (type) {
      case 'org.umi.config.list':
        success({
          data: getConfig(),
        });
        break;
      case 'org.umi.config.edit':
        (api as any).service.runCommand('config', {
          _: ['set', payload.key, payload.value],
        });
        success();
        break;
      default:
        break;
    }
  });
}
