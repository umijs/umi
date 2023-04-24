export default (api: any) => {
  api.registerCommand({
    name: 'appData',
    async fn () {
      return api.appData
    }
  })
};
