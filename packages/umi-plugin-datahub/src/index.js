import { join } from 'path';
import DataHub from 'macaca-datahub';
import datahubMiddleware from 'datahub-proxy-middleware';

export default (api, opts = {}) => {
  const datahubConfig = {
    port: 5678,
    hostname: '127.0.0.1',
    store: join(__dirname, 'data'),
    proxy: {},
    showBoard: false,
    ...opts,
  };

  const defaultDatahub = new DataHub({
    port: datahubConfig.port,
  });

  api.register('beforeServerWithApp', ({ args: { app } }) => {
    datahubMiddleware(app)(datahubConfig);
    defaultDatahub.startServer(datahubConfig).then(() => {
      console.log('datahub ready');
    });
  });
};
