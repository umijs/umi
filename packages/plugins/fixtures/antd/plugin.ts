import build from '../../../preset-umi/src/commands/build'

export default (api: any) => {
  api.registerCommand({
    name: 'appData',
    async fn () {

      return api.appData
    }
  })

  api.registerCommand({
    name: 'chainWebpack',
    async fn () {
      console.log('CMD it!');

      const chainWebpack = async (memo: any, args: Object) => {
        await api.applyPlugins({
          key: 'chainWebpack',
          type: api.ApplyPluginsType.modify,
          initialValue: memo,
          args,
        });
      };

      await api.applyPlugins({
        key: 'onBuildHtmlComplete',
        args: {
          chainWebpack,
        },
      });

      return api.appData
    }
  })

  // build(api);
};

