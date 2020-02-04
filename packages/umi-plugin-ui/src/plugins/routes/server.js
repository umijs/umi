import getRouteManager from '../../../getRouteManager';

export default function(api) {
  function getRoutes() {
    const RoutesManager = getRouteManager(api.service);
    RoutesManager.fetchRoutes();
    return RoutesManager.routes;
  }

  api.onRequest((req, res, next) => {
    console.log(`[LOG] ${req.path}`);
    switch (req.path) {
      case '/api/routes':
        res.json();
        break;
      default:
        next();
    }
  });

  api.onSocketData((type, payload, { send }) => {
    console.log(`[LOG] ${type} ${JSON.stringify(payload)}`);

    switch (type) {
      case 'generate':
        api.service
          .runCommand('generate', {
            _: payload,
          })
          .then(() => {
            console.log('generate done');
            send('routes/save', getRoutes());
          });
        break;
      case 'rm':
        api.service.runCommand('rm', {
          _: payload,
        });
        send('routes/save', getRoutes());
        break;
      case 'routes/fetch':
        send('routes/save', getRoutes());
        break;
      default:
        break;
    }
  });
}
