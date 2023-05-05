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

  api.modifyConfig(memo => {
    memo.alias = {
      ['@']: `${api.paths.cwd}-config`,
      src: `${api.paths.absSrcPath}-config`,
      tmp: `${api.paths.absTmpPath}-config`,
    }
    return memo
  })

  api.registerCommand({
    name: 'config',
    async fn () {
      return api.config
    }
  })
};
