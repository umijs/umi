import { join } from 'path';
import { IApi } from 'umi-types';
import getClientScript from './getClientScript';

export default function(api: IApi) {
  const { log } = api;

  api.onUISocket(({ action, send }) => {
    if (action.type === '@@core/getInfo') {
      const uiPlugins = api.applyPlugins('addUIPlugin', {
        initialValue: [],
      });
      const script = getClientScript(uiPlugins);
      send({
        type: `${action.type}/success`,
        payload: {
          script,
        },
      });
    }
  });

  api.addUIPlugin(require.resolve('./plugins/blocks/dist/ui.umd'));
  require('./plugins/blocks/index').default(api);

  api.registerCommand(
    'ui',
    {
      description: '[alpha] ui helper for umi applications',
      usage: `umi ui [options]`,
      options: {
        '--port': `listening port`,
      },
    },
    (args = {}) => {
      const express = require('express');
      const compression = require('compression');
      const serveStatic = require('serve-static');

      const app = express();
      app.use(compression());
      app.use(serveStatic(join(__dirname, '../../../../../../ui/dist')));

      const sockjs = require('sockjs');
      const ss = sockjs.createServer();
      ss.on('connection', conn => {
        conn.on('close', () => {});
        conn.on('data', message => {
          try {
            const { type, payload } = JSON.parse(message);
            log.debug('>> GET Socket Message:', message);
            api.applyPlugins('onUISocket', {
              args: {
                action: { type, payload },
                send(action) {
                  console.log('send', JSON.stringify(action));
                  conn.write(JSON.stringify(action));
                },
                log(message) {
                  conn.write(
                    JSON.stringify({
                      type: '@@core/log',
                      payload: message,
                    }),
                  );
                },
              },
            });
            // eslint-disable-next-line no-empty
          } catch (e) {}
        });
      });

      const port = process.env.PORT || args.port || 8001;
      const server = app.listen(port, () => {
        log.success(`umi ui listening on port ${port}`);
        log.success(`http://localhost:${port}/`);
      });

      ss.installHandlers(server, {
        prefix: '/umiui',
      });
    },
  );
}
