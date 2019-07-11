import { join } from 'path';
import getClientScript from './getClientScript';

export default function(api) {
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

  api.addUIPlugin(require.resolve('./plugins/blocks/dist/client.umd'));
  require('./plugins/blocks/server').default(api);

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
      const serveStatic = require('serve-static');

      const app = express();
      app.use(serveStatic(join(__dirname, '../../../../../../ui/dist')));

      const sockjs = require('sockjs', {
        sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
      });
      const ss = sockjs.createServer();
      ss.on('connection', conn => {
        conn.on('close', () => {});
        conn.on('data', message => {
          try {
            const { type, payload } = JSON.parse(message);
            log.debug('GET Socket:', message);
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
