import { Filter, Options, Interceptor, http } from './types';
export declare function createProxyMiddleware(context: Filter | Options, options?: Options): import('./types').RequestHandler;
export declare function responseInterceptor(interceptor: Interceptor): (proxyRes: http.IncomingMessage, req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>;
export * from './handlers';
export { Filter, Options, RequestHandler } from './types';
