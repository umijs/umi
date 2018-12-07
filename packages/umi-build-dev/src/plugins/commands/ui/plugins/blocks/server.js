export default function(api) {
  function getBlocks() {
    return [
      {
        name: 'demo',
      },
    ];
    return api.service.userConfig.getConfig({ force: true });
  }

  api.onSocketData((type, payload, { send }) => {
    console.log(`[LOG] ${type} ${JSON.stringify(payload)}`);

    switch (type) {
      case 'blocks':
        console.log('run command: block', payload);
        api.service
          .runCommand('block', {
            _: payload,
          })
          .then(() => {
            console.log('blocks done');
            send('blocks/save', getConfig());
          });
        break;
      case 'blocks/fetch':
        send('blocks/save', getBlocks());
        break;
      default:
        break;
    }
  });
}
