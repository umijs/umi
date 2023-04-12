export default (api: any) => {
  ['bar', 'foo', 'nest', 'local'].forEach(key => {
    api.registerPlugins([
      {
        id: `virtual: test-${key}`,
        key,
        config: {
          schema: ({ zod }: any) => zod.any(),
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
