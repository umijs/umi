import { IApi } from 'umi';

export default (api: IApi) => {
  // Only for mock, this hack is incomplete, do not use it in production environment
  api.onBeforeMiddleware(({ app }) => {
    app.use((req, res, next) => {
      if (req.query?.fallback) {
        // modify response
        const originWrite = res.write;
        // @ts-ignore
        res.write = function (chunk) {
          const isHtml = ~(res.getHeader('Content-Type') as string)?.indexOf(
            'text/html',
          );
          if (isHtml) {
            chunk instanceof Buffer && (chunk = chunk.toString());
            chunk = chunk.replace(
              /window\.__UMI_LOADER_DATA__/,
              'window.__UMI_LOADER_DATA_FALLBACK__',
            );
          }
          originWrite.apply(this, arguments as any);
        };
      }
      next();
    });
  });
};
