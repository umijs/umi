import HttpMock from './HttpMock';
const MOCK = process.env.MOCK;

export default function(api) {
  api.register('beforeServerWithApp', ({ args: { app } }) => {
    if (MOCK && MOCK === 'none') return;
    new HttpMock({
      app,
      cwd: api.service.cwd,
      api,
    });
  });
}
