import { resolveDefine } from './definePlugin';

test('normal', () => {
  expect(
    resolveDefine({
      userConfig: {
        define: { foo: 'bar' },
      },
    } as any),
  ).toEqual({
    foo: '"bar"',
    'process.env': {
      NODE_ENV: '"test"',
      PUBLIC_PATH: '"/"',
    },
    'process.env.SSR_MANIFEST': 'process.env.SSR_MANIFEST',
  });
});

test('env variables', () => {
  process.env.UMI_APP_FOO = 'BAR';
  process.env.APP_FOO = 'BAR';
  expect(
    resolveDefine({
      userConfig: {
        define: {},
      },
    } as any),
  ).toEqual({
    'process.env': {
      NODE_ENV: '"test"',
      UMI_APP_FOO: '"BAR"',
      PUBLIC_PATH: '"/"',
    },
    'process.env.SSR_MANIFEST': 'process.env.SSR_MANIFEST',
  });
});

test('should get SOCKET_SERVER if SOCKET_SERVER exists', () => {
  process.env.SOCKET_SERVER = 'socket.server';
  expect(
    resolveDefine({
      userConfig: {
        define: {},
      },
      host: 'test.host',
    } as any)['process.env']['SOCKET_SERVER'],
  ).toEqual('"socket.server"');
});

test('should get SOCKET_SERVER if HOST exists', () => {
  delete process.env.SOCKET_SERVER;
  expect(
    resolveDefine({
      userConfig: {
        define: {},
      },
      host: 'test.host',
    } as any)['process.env']['SOCKET_SERVER'],
  ).toEqual('"http://test.host:8000"');
});

test('should get https SOCKET_SERVER if exists', () => {
  delete process.env.SOCKET_SERVER;
  expect(
    resolveDefine({
      userConfig: {
        define: {},
        https: true,
      },
      host: 'test.host',
      port: 6666,
    } as any)['process.env']['SOCKET_SERVER'],
  ).toEqual('"https://test.host:6666"');
});
