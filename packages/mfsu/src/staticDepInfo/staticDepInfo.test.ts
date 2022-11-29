import { fsExtra } from '@umijs/utils';
import path from 'path';
import { webpack } from 'webpack';
import { StaticDepInfo } from './staticDepInfo';
import { MFSU } from '../mfsu/mfsu';

const projectRoot = path.join(__dirname, '../../fixtures/agentSamples/npm');

const mfsu = new MFSU({
  implementor: webpack as any,
  buildDepWithESBuild: true,
  depBuildConfig: null,
  startBuildWorker: null as any,
  cwd: projectRoot,
  tmpBase: projectRoot,
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
  afterEach(() => {
    fsExtra.removeSync(staticDepInfo.getCacheFilePath());
  });

  test('it form a correct struct', () => {
    staticDepInfo.writeCache();
    const cacheContent = fsExtra.readFileSync(
      staticDepInfo.getCacheFilePath(),
      'utf-8',
    );
    const cache = Object.keys(JSON.parse(cacheContent));
    expect(cache.includes('cacheDependency')).toBe(true);
    expect(cache.includes('dep')).toBe(true);
    expect(cache.includes('hash')).toBe(true);
  });
});

describe('loadCache', () => {
  const primaryRestore = staticDepInfo.restore;
  const lockFilePath = path.join(projectRoot, 'package-lock.json');
  const primaryLockFileContent = fsExtra.readFileSync(lockFilePath, 'utf-8');

  afterEach(() => {
    staticDepInfo.restore = primaryRestore;
    fsExtra.removeSync(staticDepInfo.getCacheFilePath());
    fsExtra.writeFileSync(lockFilePath, primaryLockFileContent);
  });

  test('not loadCache if no cached before', () => {
    const mockFn = jest.fn();
    staticDepInfo.restore = mockFn;
    staticDepInfo.loadCache();
    expect(mockFn).not.toBeCalled();
  });

  test('call moduleGraph.restore if no changed happen in lockfile', () => {
    staticDepInfo.writeCache();
    const mockFn = jest.fn();
    staticDepInfo.restore = mockFn;
    staticDepInfo.loadCache();
    expect(mockFn).toBeCalled();
  });

  test('not used previous cache if lockfile changed', () => {
    staticDepInfo.writeCache();
    fsExtra.writeFileSync(lockFilePath, primaryLockFileContent.repeat(2));
    const mockFn = jest.fn();
    staticDepInfo.restore = mockFn;
    staticDepInfo.loadCache();
    expect(mockFn).not.toBeCalled();
  });
});
