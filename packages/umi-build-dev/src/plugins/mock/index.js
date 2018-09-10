import createMockMiddleware from './createMockMiddleware';

export default function(api) {
  api._beforeServerWithApp(({ app }) => {
    if (process.env.MOCK !== 'none' && process.env.HTTP_MOCK !== 'none') {
      const beforeMiddlewares = api.applyPlugins('addMiddlewareBeforeMock', {
        initialValue: [],
      });
      const afterMiddlewares = api.applyPlugins('addMiddlewareAfterMock', {
        initialValue: [],
      });

      beforeMiddlewares.forEach(m => app.use(m));
      let re = createMockMiddleware(api);
      if (re !== -1) {
        app.use(re);
      }
      afterMiddlewares.forEach(m => app.use(m));
    }
  });
}
