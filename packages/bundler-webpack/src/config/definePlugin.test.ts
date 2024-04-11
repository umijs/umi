import { resolveDefine } from './definePlugin';

test('normal', () => {
  expect(
    resolveDefine({
      define: { foo: 'bar' },
    }),
  ).toEqual({
    foo: '"bar"',
    'process.env': {
      NODE_ENV: '"test"',
      PUBLIC_PATH: '"/"',
    },
  });
});

test('env variables', () => {
  process.env.UMI_APP_FOO = 'BAR';
  process.env.APP_FOO = 'BAR';
  expect(
    resolveDefine({
      define: {},
    }),
  ).toEqual({
    'process.env': {
      NODE_ENV: '"test"',
      UMI_APP_FOO: '"BAR"',
      PUBLIC_PATH: '"/"',
    },
  });
});

test('should get SOCKET_SERVER if SOCKET_SERVER exists', () => {
  process.env.SOCKET_SERVER = 'socket.server';
  process.env.HOST = 'test.host';
  expect(
    resolveDefine({
      define: {},
    })['process.env']['SOCKET_SERVER'],
  ).toEqual('"socket.server"');
});

test('should get SOCKET_SERVER if HOST exists', () => {
  delete process.env.SOCKET_SERVER;
  process.env.HOST = 'test.host';
  expect(
    resolveDefine({
      define: {},
    })['process.env']['SOCKET_SERVER'],
  ).toEqual('"http://test.host:8000"');
});

test('should get https SOCKET_SERVER if exists', () => {
  delete process.env.SOCKET_SERVER;
  process.env.HOST = 'test.host';
  process.env.PORT = '6666';
  expect(
    resolveDefine({
      define: {},
      https: true,
    })['process.env']['SOCKET_SERVER'],
  ).toEqual('"https://test.host:6666"');
});
