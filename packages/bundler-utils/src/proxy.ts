import assert from 'assert';
import type { Express } from '../compiled/express';
import { createProxyMiddleware } from '../compiled/http-proxy-middleware';
import type { ProxyOptions } from './types';

export function createProxy(
  proxy: { [key: string]: ProxyOptions } | ProxyOptions[],
  app: Express,
) {
  // Supported proxy types:
  // proxy: { target, context }
  // proxy: { '/api': { target, context } }
  // proxy: [{ target, context }]
  const proxyArr: ProxyOptions[] = Array.isArray(proxy)
    ? proxy
    : proxy.target
    ? [proxy]
    : Object.keys(proxy).map((key) => {
        return {
          ...proxy[key],
          context: key,
        };
      });

  proxyArr.forEach((proxy) => {
    let middleware: any;
    if (proxy.target) {
      assert(typeof proxy.target === 'string', 'proxy.target must be string');
      assert(proxy.context, 'proxy.context must be supplied');

      middleware = createProxyMiddleware(proxy.context, {
        ...proxy,
        onProxyReq(proxyReq, req: any, res) {
          // add origin in request header
          if (proxy.changeOrigin && proxyReq.getHeader('origin')) {
            proxyReq.setHeader('origin', new URL(proxy.target!)?.origin || '');
          }
          proxy.onProxyReq?.(proxyReq, req, res, proxy);
        },
        // Add x-real-url in response header
        onProxyRes(proxyRes, req: any, res) {
          proxyRes.headers['x-real-url'] =
            new URL(req.url || '', proxy.target as string)?.href || '';
          proxy.onProxyRes?.(proxyRes, req, res);
        },
      });
    }
    app.use((req, res, next) => {
      // Support bypass
      const bypassUrl =
        typeof proxy.bypass === 'function'
          ? proxy.bypass(req, res, proxy)
          : null;
      if (typeof bypassUrl === 'string') {
        // byPass to that url
        req.url = bypassUrl;
        return next();
      } else if (bypassUrl === false) {
        return res.end(404);
      } else if (
        (bypassUrl === null || bypassUrl === undefined) &&
        middleware
      ) {
        return middleware(req, res, next);
      } else {
        next();
      }
    });
  });
}
