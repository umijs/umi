export default (api: any) => {
  console.log('registerCommand: userConfig');

  api.registerCommand({
    name: 'userConfig',
    async fn () {
      return api.userConfig
    }
  })
};
