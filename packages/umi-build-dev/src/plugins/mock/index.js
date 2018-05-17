import HttpMock from './HttpMock';

export default function(api) {
  api.register('beforeServerWithApp', ({ args: { app } }) => {
    new HttpMock({
      app,
      cwd: api.service.cwd,
      api,
    });
  });
}
