export default function(api) {
  function getConfig() {
    return api.service.userConfig.getConfig({ force: true });
  }

  api.onSocketData((type, payload, { send }) => {
    console.log(`[LOG] ${type} ${JSON.stringify(payload)}`);

    switch (type) {
      case 'config':
        api.service
          .runCommand('config', {
            _: payload,
          })
          .then(() => {
            console.log('config done');
            send('config/save', getConfig());
          });
        break;
      case 'config/fetch':
        send('config/save', getConfig());
        break;
      default:
        break;
    }
  });
}
