import { IApi } from '@umijs/types';

export default function(api: IApi) {
  const {
    paths,
    utils: { rimraf },
  } = api;

  api.registerCommand({
    name: 'build',
    fn: async function() {
      rimraf.sync(paths.absTmpPath!);

      // generate files
      await api.applyPlugins({
        key: 'onGenerateFiles',
        type: api.ApplyPluginsType.event,
      });

      // bundle
      console.log('build');
    },
  });
}
