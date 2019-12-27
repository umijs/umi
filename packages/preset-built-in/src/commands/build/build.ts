import { IApi } from '@umijs/types';

export default function(api: IApi) {
  api.registerCommand({
    name: 'build',
    fn: async function() {
      await api.applyPlugins({
        key: 'onGenerateFiles',
        type: api.ApplyPluginsType.event,
      });
      console.log('build');
    },
  });
}
