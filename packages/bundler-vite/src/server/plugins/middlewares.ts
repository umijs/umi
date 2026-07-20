import type { Plugin } from '../../../compiled/vite';

function resolveMiddleware(middleware: any): any[] {
  const resolved = middleware.toString().includes('{ compiler }')
    ? middleware({})
    : middleware;

  return Array.isArray(resolved) ? resolved : [resolved];
}

export default function middlewaresPlugin(middlewares: any[]): Plugin {
  return {
    name: 'bundler-vite:middlewares',
    configureServer(server) {
      middlewares.flatMap(resolveMiddleware).forEach((middleware) => {
        server.middlewares.use(middleware);
      });
    },
  };
}
