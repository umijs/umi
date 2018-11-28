export default function(api) {
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
            send('config/save', {
              foo: 'bar',
            });
          });
        break;
      case 'config/fetch':
        send('config/save', {
          foo: 'bar',
        });
        break;
      default:
        break;
    }
  });
}
