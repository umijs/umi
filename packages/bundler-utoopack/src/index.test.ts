import { build as packBuild } from '@utoo/pack';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getProdUtooPackConfig, getSSRUtooPackConfig } from './config';
import {
  build,
  buildSSR,
  createDevStatsFromClientPaths,
  isUtoopackProxyStartupError,
} from './index';

type BundleOptions = import('@utoo/pack').BundleOptions;

jest.mock('@utoo/pack', () => ({
  build: jest.fn(),
  findRootDir: (cwd: string) => cwd,
}));

jest.mock('./config', () => ({
  ...jest.requireActual('./config'),
  getProdUtooPackConfig: jest.fn(),
  getSSRUtooPackConfig: jest.fn(),
}));

describe('Pack build analyzer selection', () => {
  const mockPackBuild = jest.mocked(packBuild);
  const mockProdConfig = jest.mocked(getProdUtooPackConfig);
  const mockSSRConfig = jest.mocked(getSSRUtooPackConfig);
  let cwd: string;
  let originalAnalyze: string | undefined;
  let config: BundleOptions;
  let resolveConfig: jest.Mock<Promise<BundleOptions>, []>;
  let packAnalyze: (string | undefined)[];

  function emitStats() {
    packAnalyze.push(process.env.ANALYZE);
    fs.writeFileSync(path.join(cwd, 'stats.json'), '{"assets":[]}');
  }

  function buildOpts(skipLegacyAnalyzer?: boolean) {
    return {
      cwd,
      config: {},
      entry: { umi: './src/index.ts' },
      rootDir: cwd,
      skipLegacyAnalyzer,
    };
  }

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-utoo-build-'));
    originalAnalyze = process.env.ANALYZE;
    process.env.ANALYZE = '1';
    config = {
      config: {
        entry: [{ name: 'umi', import: './src/index.ts' }],
        output: { path: cwd },
        stats: false,
      },
    };
    resolveConfig = jest.fn(async () => config);
    mockProdConfig.mockReset().mockImplementation(resolveConfig);
    mockSSRConfig.mockReset().mockImplementation(resolveConfig);
    packAnalyze = [];
    mockPackBuild.mockReset().mockImplementation(async () => emitStats());
  });

  afterEach(() => {
    if (originalAnalyze === undefined) delete process.env.ANALYZE;
    else process.env.ANALYZE = originalAnalyze;
    jest.restoreAllMocks();
    fs.rmSync(cwd, { recursive: true, force: true });
  });

  test.each(['client', 'SSR'])(
    'suppresses the legacy analyzer for an opted-in %s build only during compilation',
    async (target) => {
      resolveConfig.mockImplementation(async () => {
        expect(process.env.ANALYZE).toBe('1');
        return config;
      });
      const onBuildComplete = jest.fn(() => {
        expect(process.env.ANALYZE).toBe('1');
      });

      const stats =
        target === 'client'
          ? await build({ ...buildOpts(true), onBuildComplete })
          : await buildSSR({
              ...buildOpts(true),
              serverBuildPath: path.join(cwd, 'umi.server.js'),
            });

      expect(packAnalyze).toEqual([undefined]);
      expect(mockPackBuild.mock.calls[0][0]).toEqual({
        config: { ...config.config, stats: true },
      });
      expect(stats.assets).toEqual([]);
      expect(process.env.ANALYZE).toBe('1');
      expect(config.config.stats).toBe(false);
      if (target === 'client') expect(onBuildComplete).toHaveBeenCalledTimes(1);
    },
  );

  test('keeps the original stats option when ANALYZE is unset', async () => {
    delete process.env.ANALYZE;
    await build(buildOpts(true));
    expect(mockPackBuild.mock.calls[0][0]).toBe(config);
    expect(process.env.ANALYZE).toBeUndefined();
  });

  test('restores ANALYZE after a compilation failure', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockPackBuild.mockImplementationOnce(async () => {
      expect(process.env.ANALYZE).toBeUndefined();
      throw new Error('compiler error');
    });

    await expect(build(buildOpts(true))).rejects.toThrow(
      'Build with utoopack failed.',
    );
    expect(process.env.ANALYZE).toBe('1');
  });

  test('keeps ANALYZE visible to an overlapping build that uses the legacy analyzer', async () => {
    let finishFirstBuild = () => {};
    const firstBuildContinuation = new Promise<void>((resolve) => {
      finishFirstBuild = resolve;
    });
    const firstBuildStarted = new Promise<void>((resolve) => {
      mockPackBuild.mockImplementationOnce(async () => {
        resolve();
        await firstBuildContinuation;
        emitStats();
      });
    });
    resolveConfig.mockImplementation(async () => {
      expect(process.env.ANALYZE).toBe('1');
      return config;
    });

    const firstBuild = build(buildOpts(true));
    await firstBuildStarted;
    const secondBuild = build(buildOpts());
    finishFirstBuild();
    await Promise.all([firstBuild, secondBuild]);

    expect(packAnalyze).toEqual([undefined, '1']);
    expect(mockPackBuild.mock.calls[1][0]).toBe(config);
    expect(process.env.ANALYZE).toBe('1');
  });
});

describe('createDevStatsFromClientPaths', () => {
  test('creates lightweight compatible stats for each entry', () => {
    const stats = createDevStatsFromClientPaths(
      ['runtime.js', 'umi.css', 'runtime.js'],
      ['umi', 'admin'],
    );

    expect(stats.assets).toEqual([{ name: 'runtime.js' }, { name: 'umi.css' }]);
    expect(stats.entrypoints.umi).toEqual({
      assets: stats.assets,
      chunks: [],
    });
    expect(stats.entrypoints.admin).toEqual({
      assets: stats.assets,
      chunks: [],
    });
    expect(stats.chunks).toEqual([]);
    expect(stats.modules).toEqual([]);
    expect(stats.hasErrors()).toBe(false);
    expect(stats.toJson()).toBe(stats);
    expect(Object.keys(stats.compilation.assets)).toEqual([
      'runtime.js',
      'umi.css',
    ]);
  });

  test('creates compatible empty stats when client paths are missing', () => {
    const stats = createDevStatsFromClientPaths(undefined, ['umi']);

    expect(stats.assets).toEqual([]);
    expect(stats.entrypoints.umi).toEqual({ assets: [], chunks: [] });
    expect(stats.compilation.assets).toEqual({});
    expect(stats.hasErrors()).toBe(false);
    expect(stats.toJson()).toBe(stats);
  });
});

describe('isUtoopackProxyStartupError', () => {
  test('matches ECONNREFUSED from the utoopack dev server port', () => {
    expect(
      isUtoopackProxyStartupError(
        {
          code: 'ECONNREFUSED',
          address: '127.0.0.1',
          port: 8001,
        },
        8001,
      ),
    ).toBe(true);
  });

  test('does not match other ports', () => {
    expect(
      isUtoopackProxyStartupError(
        {
          code: 'ECONNREFUSED',
          address: '127.0.0.1',
          port: 9001,
        },
        8001,
      ),
    ).toBe(false);
  });

  test('does not match other proxy errors', () => {
    expect(
      isUtoopackProxyStartupError(
        {
          code: 'ECONNRESET',
          address: '127.0.0.1',
          port: 8001,
        },
        8001,
      ),
    ).toBe(false);
  });
});
