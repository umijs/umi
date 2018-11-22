import { readFileSync } from 'fs';

export default function(api) {
  const { log } = api;

  class PluginAPI {
    constructor(service, cache) {
      this.service = service;
      this.cache = cache;
    }
    onRequest(middleware) {
      this.cache.middlewares.push(middleware);
    }
    onSocketData(socketDataHandler) {
      this.cache.socketDataHandlers.push(socketDataHandler);
    }
  }

  const cache = {
    middlewares: [],
    socketDataHandlers: [],
  };

  api.registerCommand(
    'ui',
    {
      description: 'ui helper for umi applications',
      usage: `umi ui [options]`,
      options: {
        '--port': `listening port`,
      },
    },
    (args = {}) => {
      const express = require('express');
      const serveStatic = require('serve-static');

      const uiPlugins = api.applyPlugins('addUIPlugin', {
        initialValue: [],
      });
      const clients = [];
      uiPlugins.forEach(({ server, client }) => {
        require(server).default(new PluginAPI(api.service, cache));
        clients.push(client);
      });

      const app = express();
      app.use(serveStatic('dist'));
      cache.middlewares.forEach(middleware => {
        app.use(middleware);
      });

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
            cache.socketDataHandlers.forEach(socketDataHandler => {
              socketDataHandler(type, payload, {
                send(type, payload) {
                  console.log('send', type, payload);
                  conn.write(JSON.stringify({ type, payload }));
                },
              });
            });
          } catch (e) {}
        });
      });

      if (process.env.LOCAL_DEBUG) {
        app.get('/', (req, res) => {
          const clientsHtml = clients
            .map(
              client => `<script>\n${readFileSync(client, 'utf-8')}\n</script>`,
            )
            .join('\n');
          res.type('html');
          res.send(
            readFileSync(`${__dirname}/index-debug.html`, 'utf-8').replace(
              '<div id="root"></div>',
              `<div id="root"></div>${clientsHtml}`,
            ),
          );
        });
      }

      const port = process.env.PORT || args.port || 8001;
      const server = app.listen(port, () => {
        log.success(`umi ui listening on port ${port}`);
      });

      ss.installHandlers(server, {
        prefix: '/umiui',
      });
    },
  );

  api.addUIPlugin({
    client: require.resolve('./plugins/routes/client.umd'),
    server: require.resolve('./plugins/routes/server'),
  });
}
