import { logger } from '@umijs/utils';
import utoopack, { runBundleAnalyze } from './utoopack';

jest.mock('@umijs/utils', () => {
  const originalModule = jest.requireActual('@umijs/utils');
  return {
    __esModule: true,
    ...originalModule,
    logger: {
      ...originalModule.logger,
      event: jest.fn(),
      ready: jest.fn(),
      error: jest.fn(),
    },
  };
});

const mockUtooBundler = {
  analyze: jest.fn(),
  serveAnalyzeReport: jest.fn(),
};

// For jest.requireActual flow, the feature loads its bundler via
// require(process.env.UTOOPACK), which tests point at this virtual module.
jest.mock('mock-utoopack-bundler', () => mockUtooBundler, { virtual: true });

const REPORT_OUTPUT_PATH = '/mock/project/.turbopack/analyze';
const ENV_KEYS = ['ANALYZE', 'ANALYZE_PORT', 'UTOOPACK'];
const savedEnv: Record<string, string | undefined> = {};
let originalStdoutIsTTY: boolean | undefined;

beforeEach(() => {
  ENV_KEYS.forEach((key) => {
    savedEnv[key] = process.env[key];
  });
  originalStdoutIsTTY = process.stdout.isTTY;
  mockUtooBundler.analyze.mockReset();
  mockUtooBundler.serveAnalyzeReport.mockReset();
  (logger.event as jest.Mock).mockClear();
  (logger.ready as jest.Mock).mockClear();
  (logger.error as jest.Mock).mockClear();
});

afterEach(() => {
  ENV_KEYS.forEach((key) => {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  });
  setStdoutIsTTY(originalStdoutIsTTY);
  jest.restoreAllMocks();
});

function setStdoutIsTTY(value: boolean | undefined) {
  Object.defineProperty(process.stdout, 'isTTY', {
    value,
    configurable: true,
    writable: true,
    enumerable: true,
  });
}

function createApi() {
  return {
    describe: jest.fn(),
    onCheck: jest.fn(),
    modifyAppData: jest.fn(),
    modifyConfig: jest.fn(),
    onStart: jest.fn(),
    onDevCompileDone: jest.fn(),
    onBuildComplete: jest.fn(),
    onBuildHtmlComplete: jest.fn(),
    addHTMLStyles: jest.fn(),
    addHTMLHeadScripts: jest.fn(),
    config: { publicPath: '/static/' },
    userConfig: { utoopack: {} },
  };
}

// Injectable logger stub for direct runBundleAnalyze calls.
function createTestLogger(overrides: Record<string, any> = {}) {
  return {
    event: jest.fn(),
    ready: jest.fn(),
    error: jest.fn(),
    ...overrides,
  } as any;
}

function mockExit() {
  return jest
    .spyOn(process, 'exit')
    .mockImplementation(() => undefined as never);
}

function mockAnalyzeOk(serverUrl = 'http://127.0.0.1:8888') {
  const server = { url: serverUrl, close: jest.fn(async () => {}) };
  mockUtooBundler.analyze.mockResolvedValue({
    outputPath: REPORT_OUTPUT_PATH,
  });
  mockUtooBundler.serveAnalyzeReport.mockResolvedValue(server);
  return server;
}

test('onDevCompileDone replaces obsolete HTML assets with the current entry assets', () => {
  const api = createApi();
  utoopack(api as unknown as import('../../types').IApi);
  const compile = api.onDevCompileDone.mock.calls[0][0];
  const getStyles = api.addHTMLStyles.mock.calls[0][0];
  const getScripts = api.addHTMLHeadScripts.mock.calls[0][0];
  const stats = (files: string[]) => ({
    entrypoints: {
      umi: { assets: files, chunks: [] },
      admin: { assets: ['admin.js', 'admin.css'], chunks: [] },
    },
    chunks: [],
  });

  compile({
    stats: stats([
      'umi.old.js',
      'umi.old.css',
      'runtime.old.js',
      'runtime.old.js',
      'shared.mjs',
      'chunk.old.css',
      'runtime.hot-update.js',
    ]),
  });
  expect(getScripts()).toEqual([
    { src: '/static/runtime.old.js' },
    { src: '/static/shared.mjs' },
  ]);
  expect(getStyles()).toEqual([{ src: '/static/chunk.old.css' }]);

  compile({ stats: stats(['umi.new.js', 'runtime.new.js']) });
  expect(getScripts()).toEqual([{ src: '/static/runtime.new.js' }]);
  expect(getStyles()).toEqual([]);

  // Repeated output must not add duplicate script tags.
  compile({ stats: stats(['umi.new.js', 'runtime.new.js']) });
  expect(getScripts()).toEqual([{ src: '/static/runtime.new.js' }]);
});

test('onBuildComplete retains assets from earlier production compilations', () => {
  const api = createApi();
  utoopack(api as unknown as import('../../types').IApi);
  const build = api.onBuildComplete.mock.calls[0][0];
  const getStyles = api.addHTMLStyles.mock.calls[0][0];
  const getScripts = api.addHTMLHeadScripts.mock.calls[0][0];
  const stats = (files: string[]) => ({
    entrypoints: { umi: { assets: files, chunks: [] } },
    chunks: [],
  });

  build({ stats: stats(['umi.js', 'client-runtime.js', 'client.css']) });
  build({ stats: stats(['umi.js', 'server-runtime.js', 'server.css']) });

  expect(getScripts()).toEqual([
    { src: '/static/client-runtime.js' },
    { src: '/static/server-runtime.js' },
  ]);
  expect(getStyles()).toEqual([
    { src: '/static/client.css' },
    { src: '/static/server.css' },
  ]);
});

test('onBuildHtmlComplete when ANALYZE is falsy should return without invoking any analyze call', async () => {
  const api = createApi();
  utoopack(api as unknown as import('../../types').IApi);
  const handler = api.onBuildHtmlComplete.mock.calls[0][0];

  process.env.ANALYZE = '';
  process.env.UTOOPACK = 'mock-utoopack-bundler';

  await handler({ cwd: '/mock/project', htmlFiles: [] });

  expect(mockUtooBundler.analyze).not.toHaveBeenCalled();
  expect(mockUtooBundler.serveAnalyzeReport).not.toHaveBeenCalled();
  expect(logger.event).not.toHaveBeenCalled();
});

test('onBuildHtmlComplete when ANALYZE is truthy should run the full analyze chain and hang', async () => {
  setStdoutIsTTY(true);
  process.env.ANALYZE = '1';
  process.env.ANALYZE_PORT = '9999';
  process.env.UTOOPACK = 'mock-utoopack-bundler';
  const serverHandle = mockAnalyzeOk('http://127.0.0.1:9999');

  const api = createApi();
  utoopack(api as unknown as import('../../types').IApi);
  const handler = api.onBuildHtmlComplete.mock.calls[0][0];
  const args = {
    cwd: '/mock/project',
    entry: { index: './src/index.ts' },
    htmlFiles: [{ path: 'index.html' }],
  };

  // Without an injected wait the handler promise stays pending (the real
  // run hangs until Ctrl-C).
  const handlerPromise = handler(args);
  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve('timeout'), 50),
  );
  expect(await Promise.race([handlerPromise, timeout])).toBe('timeout');

  expect(mockUtooBundler.analyze).toHaveBeenCalledTimes(1);
  expect(mockUtooBundler.analyze).toHaveBeenCalledWith(args);
  expect(mockUtooBundler.serveAnalyzeReport).toHaveBeenCalledTimes(1);
  expect(mockUtooBundler.serveAnalyzeReport).toHaveBeenCalledWith(
    REPORT_OUTPUT_PATH,
    9999,
  );
  expect(mockUtooBundler.analyze.mock.invocationCallOrder[0]).toBeLessThan(
    mockUtooBundler.serveAnalyzeReport.mock.invocationCallOrder[0],
  );
  expect(logger.event).toHaveBeenNthCalledWith(1, 'Bundle analyzing...');
  expect(logger.event).toHaveBeenNthCalledWith(
    2,
    `Analyzer report written to ${REPORT_OUTPUT_PATH}`,
  );
  expect(logger.ready).toHaveBeenCalledWith(
    `Bundle Analyzer available at ${serverHandle.url}`,
  );

  // Injecting a resolvable wait drives the same chain to completion, and an
  // invalid ANALYZE_PORT falls back to the default port 8888.
  mockUtooBundler.analyze.mockClear();
  mockUtooBundler.serveAnalyzeReport.mockClear();
  process.env.ANALYZE_PORT = 'abc';
  const wait = jest.fn(async () => undefined as never);
  await runBundleAnalyze(
    mockUtooBundler,
    { cwd: '/mock/project' },
    createTestLogger(),
    wait,
  );
  expect(mockUtooBundler.serveAnalyzeReport).toHaveBeenCalledWith(
    REPORT_OUTPUT_PATH,
    8888,
  );
  expect(wait).toHaveBeenCalledTimes(1);
});

test('runBundleAnalyze when analyze rejects should log error and exit 1', async () => {
  setStdoutIsTTY(true);
  const exitSpy = mockExit();
  const testLogger = createTestLogger();
  const analyzeError = new Error('analyze boom');
  mockUtooBundler.analyze.mockRejectedValue(analyzeError);

  await runBundleAnalyze(mockUtooBundler, { cwd: '/mock/project' }, testLogger);

  expect(testLogger.event).toHaveBeenCalledWith('Bundle analyzing...');
  expect(testLogger.error).toHaveBeenCalledWith(analyzeError);
  expect(exitSpy).toHaveBeenCalledWith(1);
  expect(mockUtooBundler.serveAnalyzeReport).not.toHaveBeenCalled();
});

test('runBundleAnalyze when bundler lacks analyze fn should fail fast with upgrade hint', async () => {
  const exitSpy = mockExit();
  const testLogger = createTestLogger();
  const legacyBundler = {
    analyze: undefined,
    serveAnalyzeReport: jest.fn(),
  } as any;

  await runBundleAnalyze(legacyBundler, { cwd: '/mock/project' }, testLogger);

  expect(testLogger.event).not.toHaveBeenCalled();
  expect(testLogger.ready).not.toHaveBeenCalled();
  expect(legacyBundler.serveAnalyzeReport).not.toHaveBeenCalled();
  expect(testLogger.error).toHaveBeenCalledWith(
    'Utoopack analyze requires @umijs/bundler-utoopack with analyze support, please align @umijs/preset-umi and @umijs/bundler-utoopack versions',
  );
  expect(exitSpy).toHaveBeenCalledWith(1);
});

test('runBundleAnalyze when serve succeeds but a later step throws should close server and exit 1', async () => {
  setStdoutIsTTY(true);
  const exitSpy = mockExit();
  const serverHandle = mockAnalyzeOk();
  const testLogger = createTestLogger({
    ready: jest.fn(() => {
      throw new Error('logger ready blew up');
    }),
  });

  await runBundleAnalyze(mockUtooBundler, { cwd: '/mock/project' }, testLogger);

  expect(serverHandle.close).toHaveBeenCalledTimes(1);
  expect(serverHandle.close.mock.invocationCallOrder[0]).toBeLessThan(
    exitSpy.mock.invocationCallOrder[0],
  );
  expect(testLogger.error).toHaveBeenCalledWith(
    `Analyzer report written to ${REPORT_OUTPUT_PATH} (open ${REPORT_OUTPUT_PATH}/index.html directly)`,
  );
  expect(testLogger.error).toHaveBeenCalledWith(
    'Analyzer UI server failed: logger ready blew up. A previous Analyzer process may still be running (Ctrl-C it in its terminal), or set ANALYZE_PORT to use another port.',
  );
  expect(exitSpy).toHaveBeenCalledWith(1);
});

test('runBundleAnalyze with non-tty stdout should skip serve and hang-free return', async () => {
  setStdoutIsTTY(false);
  const exitSpy = mockExit();
  const testLogger = createTestLogger();
  mockAnalyzeOk();
  const wait = jest.fn(async () => undefined as never);

  await runBundleAnalyze(
    mockUtooBundler,
    { cwd: '/mock/project' },
    testLogger,
    wait,
  );

  expect(mockUtooBundler.analyze).toHaveBeenCalledTimes(1);
  expect(testLogger.event).toHaveBeenCalledWith(
    `Analyzer report written to ${REPORT_OUTPUT_PATH}`,
  );
  expect(testLogger.ready).toHaveBeenCalledWith(
    `Non-interactive terminal detected, skipping Analyzer UI server. Open ${REPORT_OUTPUT_PATH}/index.html in a browser.`,
  );
  expect(mockUtooBundler.serveAnalyzeReport).not.toHaveBeenCalled();
  expect(wait).not.toHaveBeenCalled();
  expect(exitSpy).not.toHaveBeenCalled();
});

test('runBundleAnalyze when serve rejects should print report path and port hint then exit 1', async () => {
  setStdoutIsTTY(true);
  const exitSpy = mockExit();
  const testLogger = createTestLogger();
  mockUtooBundler.analyze.mockResolvedValue({
    outputPath: REPORT_OUTPUT_PATH,
  });
  mockUtooBundler.serveAnalyzeReport.mockRejectedValue(
    new Error('listen EADDRINUSE 0.0.0.0:8888'),
  );

  await runBundleAnalyze(mockUtooBundler, { cwd: '/mock/project' }, testLogger);

  expect(testLogger.error).toHaveBeenCalledWith(
    `Analyzer report written to ${REPORT_OUTPUT_PATH} (open ${REPORT_OUTPUT_PATH}/index.html directly)`,
  );
  expect(testLogger.error).toHaveBeenCalledWith(
    'Analyzer UI server failed: listen EADDRINUSE 0.0.0.0:8888. A previous Analyzer process may still be running (Ctrl-C it in its terminal), or set ANALYZE_PORT to use another port.',
  );
  expect(exitSpy).toHaveBeenCalledWith(1);
});
