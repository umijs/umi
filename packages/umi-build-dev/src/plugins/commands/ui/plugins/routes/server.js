export default function(api, opts = {}) {
  console.log('plugins/routes/server');

  api.onRequest((req, res, next) => {
    console.log(`[LOG] ${req.path}`);
    next();
  });

  api.onSocketData((type, payload) => {
    console.log(`[LOG] ${type} ${payload}`);
  });
}
