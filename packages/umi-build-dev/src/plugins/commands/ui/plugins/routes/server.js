import getRouteManager from '../../../getRouteManager';

export default function(api) {
  console.log('plugins/routes/server');

  function getRoutes() {
    const RoutesManager = getRouteManager(api.service);
    RoutesManager.fetchRoutes();
    return RoutesManager.routes;
  }

  api.onRequest((req, res, next) => {
    console.log(`[LOG] ${req.path}`);
    switch (req.path) {
      case '/api/routes':
        res.json(getRoutes());
        break;
      default:
        next();
    }
  });

  api.onSocketData((type, payload) => {
    console.log(`[LOG] ${type} ${payload}`);
  });
}
