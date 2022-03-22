export default (api: any) => {
  ['bar', 'foo', 'nest'].forEach(key => {
    api.registerPlugins([
      {
        id: `virtual: test-${key}`,
        key,
        config: {
          schema: (Joi: any) => Joi.any(),
        }
      },
    ]);
  })

  api.registerCommand({
    name: 'userConfig',
    async fn () {
      return api.userConfig
    }
  })
};
