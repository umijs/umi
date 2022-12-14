import { fsExtra } from '@umijs/utils';
import path from 'path';
import { webpack } from 'webpack';
import { DepInfo } from './depInfo';
import { MFSU } from './mfsu/mfsu';
import { ModuleGraph } from './moduleGraph';

const fixtureDir = path.join(__dirname, '../fixtures/depInfo');

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
  it('should generate with a correct struct', () => {
    depInfo.writeCache();
    const cacheContent = fsExtra.readFileSync(
      depInfo.getCacheFilePath(),
      'utf-8',
    );
    const cache = Object.keys(JSON.parse(cacheContent));
    expect(cache).toContain('cacheDependency');
    expect(cache).toContain('moduleGraph');
    expect(cache).toContain('hash');
  });
});

describe('loadCache', () => {
  const lockFilePath = path.join(fixtureDir, 'pnpm-lock.yaml');
  const content = 'Hello World';

  const restoreMockFn = jest
    .spyOn(ModuleGraph.prototype, 'restore')
    .mockImplementation(() => {
      console.log('mocked function');
    });

  beforeEach(() => {
    jest.clearAllMocks();
    fsExtra.emptyDirSync(fixtureDir);
    fsExtra.writeFileSync(lockFilePath, content);
  });

  afterEach(() => {
    fsExtra.emptyDirSync(fixtureDir);
  });

  test('not loadCache if no cached before', () => {
    depInfo.loadCache();
    expect(restoreMockFn).not.toBeCalled();
  });

  test('call moduleGraph.restore if no changed happen in lockfile', () => {
    depInfo.writeCache();

    depInfo.loadCache();
    expect(restoreMockFn).toHaveBeenCalledTimes(1);
    depInfo.loadCache();
    expect(restoreMockFn).toHaveBeenCalledTimes(2);
  });

  test('not used previous cache if lockfile changed', () => {
    depInfo.writeCache();
    fsExtra.writeFileSync(lockFilePath, content.repeat(2));
    depInfo.loadCache();
    expect(restoreMockFn).not.toBeCalled();
  });
});
