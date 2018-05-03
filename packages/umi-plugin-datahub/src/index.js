import { join } from 'path';
import DataHub from 'macaca-datahub';
import datahubMiddleware from 'datahub-proxy-middleware';

const datahubConfig = {
  port: 5678,
  hostname: '127.0.0.1',
  store: join(__dirname, 'data'),
  proxy: {
    '^/api': {
      hub: 'ifccustmng',
    },
  },
  showBoard: false,
};

const defaultDatahub = new DataHub({
  port: datahubConfig.port,
});

export default api => {
  api.register('beforeServerWithApp', ({ args: { app } }) => {
    datahubMiddleware(app)(datahubConfig);
    defaultDatahub.startServer(datahubConfig).then(() => {
      console.log('datahub ready');
    });
  });
};
