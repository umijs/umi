import IConfigProcessor from './devServer';

test('test transform devServer umi config', () => {
  expect(
    IConfigProcessor(
      { devServer: { port: 11, host: 'www.taobao.com/', https: true } },
      {},
    ),
  ).toEqual({
    server: {
      port: 11,
      host: 'www.taobao.com/',
      https: true,
    },
  });
});

test('test proxy umi config', () => {
  expect(IConfigProcessor({ proxy: 'proxy' }, {})).toEqual({
    server: {
      proxy: 'proxy',
    },
  });
});
