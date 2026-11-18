jest.mock('@umijs/bundler-webpack', () => ({
  getConfig: jest.fn(async () => ({
    output: {},
    resolve: {
      alias: {},
    },
  })),
  resolveStaticPathPrefix: ({
    staticPathPrefix,
    userConfig,
  }: {
    staticPathPrefix?: string;
    userConfig?: { staticPathPrefix?: string };
  }) => {
    if (staticPathPrefix !== undefined) return staticPathPrefix;
    if (userConfig?.staticPathPrefix !== undefined) {
      return userConfig.staticPathPrefix;
    }
    return 'static/';
  },
}));

jest.mock('@utoo/pack', () => ({
  compatOptionsFromWebpack: jest.fn((webpackConfig) => ({
    config: {
      entry: webpackConfig.entry,
      output: {},
      resolve: {
        alias: webpackConfig.resolve?.alias || {},
      },
    },
  })),
  findRootDir: jest.fn((cwd: string) => cwd),
  build: jest.fn(),
  analyze: jest.fn(),
  serveAnalyzeReport: jest.fn(),
}));

import { getConfig } from '@umijs/bundler-webpack';
import {
  findRootDir,
  analyze as utooPackAnalyze,
  build as utooPackBuild,
  serveAnalyzeReport as utooPackServeAnalyzeReport,
} from '@utoo/pack';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { analyze, serveAnalyzeReport } from './analyze';
import { getProdUtooPackConfig, normalizeUtoopackPath } from './config';

type IUtoopackAnalyzeOpts = import('./analyze').IUtoopackAnalyzeOpts;

const mockedGetConfig = getConfig as jest.Mock;
const mockedUtooPackAnalyze = utooPackAnalyze as jest.Mock;
const mockedUtooPackBuild = utooPackBuild as jest.Mock;
const mockedFindRootDir = findRootDir as jest.Mock;
const mockedUtooPackServe = utooPackServeAnalyzeReport as jest.Mock;

// Explicit utoopack root config keeps rootDir resolution off the filesystem.
const UTOOPACK_ROOT = 'packages/utoo-root';

let cwd: string;
let normalizedCwd: string;
let expectedRootDir: string;

function createAnalyzeOpts(): IUtoopackAnalyzeOpts {
  return {
    cwd,
    entry: {
      index: './src/index.tsx',
    },
    config: {
      utoopack: {
        root: UTOOPACK_ROOT,
      },
    },
  };
}

async function withoutPackExport(
  name: 'analyze' | 'serveAnalyzeReport',
  fn: () => Promise<void>,
) {
  const runtime: Record<string, any> = require('@utoo/pack');
  const original = runtime[name];
  runtime[name] = undefined;
  try {
    await fn();
  } finally {
    runtime[name] = original;
  }
}

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-utoo-analyze-'));
  normalizedCwd = normalizeUtoopackPath(cwd);
  expectedRootDir = normalizeUtoopackPath(
    path.resolve(normalizedCwd, UTOOPACK_ROOT),
  );

  mockedGetConfig.mockClear();
  mockedUtooPackBuild.mockClear();
  mockedFindRootDir.mockClear();
  mockedUtooPackAnalyze.mockReset();
  mockedUtooPackAnalyze.mockResolvedValue({
    outputPath: `${normalizedCwd}/.utoo/analyze`,
    entries: ['must-not-leak-through-the-bridge'],
  });
  mockedUtooPackServe.mockClear();
});

afterEach(() => {
  fs.rmSync(cwd, { recursive: true, force: true });
});

describe('analyze', () => {
  test('analyze when given build opts should call utooPackAnalyze with the resolved production config', async () => {
    // rootDir is bogus on purpose: the bridge must compute it and ignore
    // whatever the caller passed.
    const opts = {
      ...createAnalyzeOpts(),
      rootDir: '/caller/supplied/root',
    };

    const expectedConfig = await getProdUtooPackConfig({
      ...opts,
      cwd: normalizedCwd,
      rootDir: expectedRootDir,
    });

    const result = await analyze(opts);

    expect(mockedUtooPackAnalyze).toHaveBeenCalledTimes(1);
    expect(mockedUtooPackAnalyze.mock.calls[0]).toHaveLength(3);
    expect(mockedUtooPackAnalyze).toHaveBeenCalledWith(
      expectedConfig,
      normalizedCwd,
      expectedRootDir,
    );
    expect(mockedGetConfig).toHaveBeenCalledWith(
      expect.objectContaining({ rootDir: expectedRootDir }),
    );
    expect(result).toEqual({
      outputPath: `${normalizedCwd}/.utoo/analyze`,
    });
  });

  test('analyze should only invoke the analyze runtime and never build or other bundler APIs', async () => {
    await analyze(createAnalyzeOpts());

    expect(mockedUtooPackAnalyze).toHaveBeenCalledTimes(1);
    expect(mockedUtooPackBuild).not.toHaveBeenCalled();
    expect(mockedFindRootDir).not.toHaveBeenCalled();
    expect(mockedUtooPackServe).not.toHaveBeenCalled();
  });

  test('analyze when @utoo/pack lacks analyze export should throw the actionable guard error', async () => {
    await withoutPackExport('analyze', async () => {
      await expect(analyze(createAnalyzeOpts())).rejects.toThrow(
        'Utoopack analyze requires @utoo/pack >= 1.6.0, please reinstall @umijs/bundler-utoopack',
      );
    });
    expect(mockedGetConfig).not.toHaveBeenCalled();
  });
});

describe('serveAnalyzeReport', () => {
  test('serveAnalyzeReport should forward both args and pass through the server handle', async () => {
    const serverHandle = {
      url: 'http://127.0.0.1:8888',
      close: jest.fn(async () => {}),
    };
    mockedUtooPackServe.mockResolvedValue(serverHandle);

    const server = await serveAnalyzeReport('/mocked/report/path', 8888);

    expect(mockedUtooPackServe).toHaveBeenCalledTimes(1);
    expect(mockedUtooPackServe).toHaveBeenCalledWith(
      '/mocked/report/path',
      8888,
    );
    expect(server).toBe(serverHandle);
  });

  test('serveAnalyzeReport when @utoo/pack lacks serveAnalyzeReport export should throw the actionable guard error', async () => {
    await withoutPackExport('serveAnalyzeReport', async () => {
      await expect(
        serveAnalyzeReport('/mocked/report/path', 8888),
      ).rejects.toThrow(
        'Utoopack analyze requires @utoo/pack >= 1.6.0, please reinstall @umijs/bundler-utoopack',
      );
    });
  });
});
