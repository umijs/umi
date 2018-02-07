import HttpMock from './HttpMock';

export default function(api) {
  api.register('beforeServer', ({ args: { devServer } }) => {
    new HttpMock({
      devServer,
      cwd: api.service.cwd,
      api,
    });
  });
}
