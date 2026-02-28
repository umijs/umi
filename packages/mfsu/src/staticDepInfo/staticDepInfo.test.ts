import { fsExtra, rimraf, logger } from '@umijs/utils';
import { join } from 'path';
import { webpack } from 'webpack';
import { StaticDepInfo } from './staticDepInfo';
import { MFSU } from '../mfsu/mfsu';

const fixtureDir = join(__dirname, '../../fixtures/depInfo/dir-staticInfo');

const mfsu = new MFSU({
  implementor: webpack as any,
  buildDepWithESBuild: true,
  depBuildConfig: null,
  startBuildWorker: null as any,
  cwd: fixtureDir,
  tmpBase: fixtureDir,
});

const Noop = () => {};

const staticDepInfo = new StaticDepInfo({
  mfsu,
  srcCodeCache: {
    register: Noop,
    getMergedCode: Noop,
    handleFileChangeEvents: Noop,
    replayChangeEvents: Noop,
  } as any, // not use `srcCodeCache` now, so just set it to `any` to happy with TS  {}
});

describe('writeCache', () => {
  beforeEach(() => {
    fsExtra.ensureDirSync(fixtureDir);
  });
  afterEach(() => {
    rimraf.sync(fixtureDir);
  });

  it('should generate with a correct struct', () => {
    staticDepInfo.writeCache();
    const cacheContent = fsExtra.readFileSync(
      staticDepInfo.getCacheFilePath(),
      'utf-8',
    );
    const cache = Object.keys(JSON.parse(cacheContent));
    expect(cache).toContain('cacheDependency');
    expect(cache).toContain('dep');
    expect(cache).toContain('patchesHash');
  });
});

jest.mock('@umijs/utils', () => {
  // Require the original module to not be mocked...
  const originalModule = jest.requireActual('@umijs/utils');

  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    logger: {
      ...originalModule.logger,
      info: jest.fn(),
    },
  };
});

describe('loadCache', () => {
  const infoMockFn = logger.info;
  const successText = '[MFSU][eager] restored cache';

  beforeEach(() => {
    fsExtra.ensureDirSync(join(fixtureDir, 'patches'));
  });

  afterEach(() => {
    rimraf.sync(fixtureDir);
    jest.clearAllMocks();
  });

  test('not loadCache if no cached before', () => {
    staticDepInfo.loadCache();
    expect(infoMockFn).not.toBeCalledWith(successText);
  });

  test('call moduleGraph.restore if no changed happen in patches dir', () => {
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'a.patch'));
    staticDepInfo.writeCache();
    staticDepInfo.loadCache();
    expect(infoMockFn).toBeCalledWith(successText);
    staticDepInfo.loadCache();
    expect(infoMockFn).toBeCalledWith(successText);
  });

  test('not used previous cache if patches dir changed', () => {
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'a.patch'));
    staticDepInfo.writeCache();
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'b.patch'));
    staticDepInfo.loadCache();
    expect(infoMockFn).not.toBeCalledWith(successText);
  });
});
