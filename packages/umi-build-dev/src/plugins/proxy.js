import httpProxyMiddleware from 'http-proxy-middleware';

export default function(api) {
  api.register('beforeServerWithApp', ({ args: { app } }) => {
    const { config, webpackRCConfig } = api.service;
    let proxy = webpackRCConfig.proxy || config.proxy;
    delete config.proxy;
    delete webpackRCConfig.proxy;
    if (!proxy) return;

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
      proxy = Object.keys(proxy).map(context => {
        let proxyOptions;
        // For backwards compatibility reasons.
        const correctedContext = context
          .replace(/^\*$/, '**')
          .replace(/\/\*$/, '');
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
        const bypassUrl =
          (bypass && proxyConfig.bypass(req, res, proxyConfig)) || false;

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
  });
}
