import httpProxyMiddleware from 'http-proxy-middleware';

function PROXY_START(req, res, next) {
  next();
}
function PROXY_END(req, res, next) {
  next();
}

export default function(api) {
  const { debug } = api;

  api._beforeServerWithApp(({ app }) => {
    const { config } = api.service;
    loadProxy(config.proxy);
    delete config.proxy;
    global.g_umi_reloadProxy = reloadProxy; // eslint-disable-line

    function deleteRoutes() {
      let startIndex = null;
      let endIndex = null;
      app._router.stack.forEach((item, index) => {
        if (item.name === 'PROXY_START') startIndex = index;
        if (item.name === 'PROXY_END') endIndex = index;
      });
      debug(
        `routes before changed: ${app._router.stack
          .map(item => item.name || 'undefined name')
          .join(', ')}`,
      );
      if (startIndex !== null && endIndex !== null) {
        app._router.stack.splice(startIndex, endIndex - startIndex + 1);
      }
      debug(
        `routes after changed: ${app._router.stack
          .map(item => item.name || 'undefined name')
          .join(', ')}`,
      );
    }

    function reloadProxy(proxy) {
      loadProxy(proxy, /* isWatch */ true);
    }

    function loadProxy(proxy = [], isWatch) {
      /**
       * Assume a proxy configuration specified as:
       * proxy: {
       *   'context': { options }
       * }
       * OR
       * proxy: {
       *   'context': 'target'
       * }
       */
      if (!Array.isArray(proxy)) {
        proxy = Object.keys(proxy)
          .sort((a, b) => {
            // /testa need set before /test
            return a > b ? -1 : 1;
          })
          .map(context => {
            let proxyOptions;
            // For backwards compatibility reasons.
            const correctedContext = context.replace(/^\*$/, '**').replace(/\/\*$/, '');
            if (typeof proxy[context] === 'string') {
              proxyOptions = {
                context: correctedContext,
                target: proxy[context],
              };
            } else {
              proxyOptions = Object.assign({}, proxy[context]);
              proxyOptions.context = correctedContext;
            }
            proxyOptions.logLevel = proxyOptions.logLevel || 'warn';
            return proxyOptions;
          });
      }

      const getProxyMiddleware = proxyConfig => {
        const context = proxyConfig.context || proxyConfig.path;

        // It is possible to use the `bypass` method without a `target`.
        // However, the proxy middleware has no use in this case, and will fail to instantiate.
        if (proxyConfig.target) {
          return httpProxyMiddleware(context, proxyConfig);
        }
      };

      let startIndex = null;
      let endIndex = null;
      let routesLength = null;

      if (isWatch) {
        app._router.stack.forEach((item, index) => {
          if (item.name === 'PROXY_START') startIndex = index;
          if (item.name === 'PROXY_END') endIndex = index;
        });
        if (startIndex !== null && endIndex !== null) {
          app._router.stack.splice(startIndex, endIndex - startIndex + 1);
        }
        routesLength = app._router.stack.length;

        deleteRoutes();
      }

      app.use(PROXY_START);

      /**
       * Assume a proxy configuration specified as:
       * proxy: [
       *   {
       *     context: ...,
       *     ...options...
       *   },
       *   // or:
       *   function() {
       *     return {
       *       context: ...,
       *       ...options...
       *     };
       *   }
       * ]
       */
      proxy.forEach(proxyConfigOrCallback => {
        let proxyConfig;
        let proxyMiddleware;

        if (typeof proxyConfigOrCallback === 'function') {
          proxyConfig = proxyConfigOrCallback();
        } else {
          proxyConfig = proxyConfigOrCallback;
        }

        proxyMiddleware = getProxyMiddleware(proxyConfig);
        // if (proxyConfig.ws) {
        //   websocketProxies.push(proxyMiddleware);
        // }

        app.use((req, res, next) => {
          if (typeof proxyConfigOrCallback === 'function') {
            const newProxyConfig = proxyConfigOrCallback();
            if (newProxyConfig !== proxyConfig) {
              proxyConfig = newProxyConfig;
              proxyMiddleware = getProxyMiddleware(proxyConfig);
            }
          }
          const bypass = typeof proxyConfig.bypass === 'function';
          // eslint-disable-next-line
          const bypassUrl = (bypass && proxyConfig.bypass(req, res, proxyConfig)) || false;

          if (bypassUrl) {
            req.url = bypassUrl;
            next();
          } else if (proxyMiddleware) {
            return proxyMiddleware(req, res, next);
          } else {
            next();
          }
        });
      });

      app.use(PROXY_END);

      if (isWatch) {
        const newRoutes = app._router.stack.splice(
          routesLength,
          app._router.stack.length - routesLength,
        );
        app._router.stack.splice(startIndex, 0, ...newRoutes);
      }

      debug(
        `routes after resort: ${app._router.stack
          .map(item => item.name || 'undefined name')
          .join(', ')}`,
      );
    }
  });
}
