import type { Plugin } from '../../../compiled/vite';

const originalUrlKey = Symbol('bundler-vite:original-url');

function resolveMiddleware(middleware: any): any[] {
  const resolved = middleware.toString().includes('{ compiler }')
    ? middleware({})
    : middleware;

  return Array.isArray(resolved) ? resolved : [resolved];
}

function stripBase(url: string, base: string): string {
  if (base === '/') {
    return url;
  }

  const basePath = new URL(base, 'http://vite.local').pathname.replace(
    /\/$/,
    '',
  );
  const pathname = url.split('?')[0];
  if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
    return url.slice(basePath.length) || '/';
  }

  return url;
}

function captureOriginalUrl(base: string) {
  return function bundlerViteCaptureOriginalUrl(
    req: any,
    _res: any,
    next: any,
  ) {
    req[originalUrlKey] = stripBase(req.url, base);
    next();
  };
}

function preserveOriginalUrl(middleware: any) {
  return function bundlerViteAfterMiddleware(req: any, res: any, next: any) {
    const viteUrl = req.url;
    req.url = req[originalUrlKey] ?? req.url;

    middleware(req, res, (err?: any) => {
      req.url = viteUrl;
      next(err);
    });
  };
}

export default function middlewaresPlugin(middlewares: any[]): Plugin {
  return {
    name: 'bundler-vite:middlewares',
    enforce: 'pre',
    configureServer(server) {
      // Vite's HTML fallback rewrites SPA requests to /index.html before
      // configureServer post hooks. Preserve the original URL so Umi
      // middlewares keep observing the same URL as they did before Vite 7.
      server.middlewares.use(captureOriginalUrl(server.config.base));

      // Post hooks run after Vite's transform and static middlewares. `enforce`
      // keeps this hook before Umi's HTML middleware.
      return () => {
        middlewares.flatMap(resolveMiddleware).forEach((middleware) => {
          server.middlewares.use(preserveOriginalUrl(middleware));
        });
      };
    },
  };
}
