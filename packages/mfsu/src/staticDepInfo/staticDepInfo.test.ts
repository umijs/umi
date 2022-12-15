import { fsExtra, rimraf } from '@umijs/utils';
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

describe('loadCache', () => {
  const restoreMockFn = jest.fn();
  const originalRestore = staticDepInfo.restore;
  staticDepInfo.restore = restoreMockFn;

  beforeEach(() => {
    fsExtra.ensureDirSync(join(fixtureDir, 'patches'));
  });

  afterEach(() => {
    restoreMockFn.mockClear();
    rimraf.sync(fixtureDir);
  });

  afterAll(() => {
    staticDepInfo.restore = originalRestore;
  });

  test('not loadCache if no cached before', () => {
    staticDepInfo.loadCache();
    expect(restoreMockFn).not.toBeCalled();
  });

  test('call moduleGraph.restore if no changed happen in patches dir', () => {
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'a.patch'));
    staticDepInfo.writeCache();
    staticDepInfo.loadCache();
    expect(restoreMockFn).toBeCalledTimes(1);
    staticDepInfo.loadCache();
    expect(restoreMockFn).toBeCalledTimes(2);
  });

  test('not used previous cache if patches dir changed', () => {
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'a.patch'));
    staticDepInfo.writeCache();
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'b.patch'));
    staticDepInfo.loadCache();
    expect(restoreMockFn).not.toBeCalled();
  });
});
