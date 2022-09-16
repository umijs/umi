import { RequestConfig } from 'umi';

export const request: RequestConfig = {
  middlewares: [
    async function middlewareA(ctx, next) {
      console.log('A before');
      await next();
      console.log('A after');
    },
    async function middlewareB(ctx, next) {
      console.log('B before');
      await next();
      console.log('B after');
    },
  ],
  requestInterceptors: [
    (url, options) => {
      console.log('> ', url);
      return {
        url: `${url}&interceptors=yes`,
        options: { ...options, interceptors: true },
      };
    },
  ],
};
