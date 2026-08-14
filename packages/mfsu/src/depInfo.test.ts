import { fsExtra, rimraf } from '@umijs/utils';
import path, { join } from 'path';
import webpack from '@umijs/bundler-webpack/compiled/webpack';
import { DepInfo } from './depInfo';
import { MFSU } from './mfsu/mfsu';
import { ModuleGraph } from './moduleGraph';

const fixtureDir = path.join(__dirname, '../fixtures/depInfo/dir-depInfo');

const mfsu = new MFSU({
  implementor: webpack as any,
  buildDepWithESBuild: true,
  depBuildConfig: null,
  startBuildWorker: null as any,
  cwd: fixtureDir,
  tmpBase: fixtureDir,
});

const depInfo = new DepInfo({
  mfsu,
});

describe('writeCache', () => {
  afterEach(() => {
    rimraf.sync(fixtureDir);
  });

  it('should generate with a correct struct', () => {
    depInfo.writeCache();
    const cacheContent = fsExtra.readFileSync(
      depInfo.getCacheFilePath(),
      'utf-8',
    );
    const cache = Object.keys(JSON.parse(cacheContent));
    expect(cache).toContain('cacheDependency');
    expect(cache).toContain('moduleGraph');
    expect(cache).toContain('patchesHash');
  });
});

describe('loadCache', () => {
  const restoreMockFn = jest
    .spyOn(ModuleGraph.prototype, 'restore')
    .mockImplementation(() => {});

  beforeEach(() => {
    fsExtra.ensureDirSync(join(fixtureDir, 'patches'));
  });

  afterEach(() => {
    rimraf.sync(fixtureDir);
    jest.clearAllMocks();
  });

  test('not loadCache if no cached before', () => {
    depInfo.loadCache();
    expect(restoreMockFn).not.toBeCalled();
  });

  test('call moduleGraph.restore if no changed happen in patches dir', () => {
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'a.patch'));
    depInfo.writeCache();
    depInfo.loadCache();
    expect(restoreMockFn).toHaveBeenCalledTimes(1);
    depInfo.loadCache();
    expect(restoreMockFn).toHaveBeenCalledTimes(2);
  });

  test('not call restore if patches changed', () => {
    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'a.patch'));
    depInfo.writeCache();

    fsExtra.ensureFileSync(join(fixtureDir, 'patches', 'b.patch'));
    depInfo.loadCache();
    expect(restoreMockFn).not.toBeCalled();
  });
});
