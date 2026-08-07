import type { IApi } from 'umi';

export default (api: IApi) => {
  api.addMiddlewares(() => [
    (req, res, next) => {
      if (req.url === '/middleware-order') {
        res.end('middleware-order-ok');
        return;
      }
      next();
    },
  ]);
};
