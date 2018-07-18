import createMockMiddleware from './createMockMiddleware';

export default function(api) {
  api.register('_beforeServerWithApp', ({ args: { app } }) => {
    if (process.env.MOCK !== 'none' && process.env.HTTP_MOCK !== 'none') {
      app.use(createMockMiddleware(api));
    }
  });
}
