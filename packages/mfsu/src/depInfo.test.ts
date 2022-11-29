import { fsExtra } from '@umijs/utils';
import path from 'path';
import { webpack } from 'webpack';
import { DepInfo } from './depInfo';
import { MFSU } from './mfsu/mfsu';

const projectRoot = path.join(__dirname, '../fixtures/agentSamples/pnpm');

const mfsu = new MFSU({
  implementor: webpack as any,
  buildDepWithESBuild: true,
  depBuildConfig: null,
  startBuildWorker: null as any,
  cwd: projectRoot,
  tmpBase: projectRoot,
});

const depInfo = new DepInfo({
  mfsu,
});

describe('writeCache', () => {
  afterEach(() => {
    fsExtra.removeSync(depInfo.getCacheFilePath());
  });

  test('it form a correct struct', () => {
    depInfo.writeCache();
    const cacheContent = fsExtra.readFileSync(
      depInfo.getCacheFilePath(),
      'utf-8',
    );
    const cache = Object.keys(JSON.parse(cacheContent));
    expect(cache.includes('cacheDependency')).toBe(true);
    expect(cache.includes('moduleGraph')).toBe(true);
    expect(cache.includes('hash')).toBe(true);
  });
});

describe('loadCache', () => {
  const primaryRestore = depInfo.moduleGraph.restore;
  const lockFilePath = path.join(projectRoot, 'pnpm-lock.yaml');
  const primaryLockFileContent = fsExtra.readFileSync(lockFilePath, 'utf-8');

  afterEach(() => {
    depInfo.moduleGraph.restore = primaryRestore;
    fsExtra.removeSync(depInfo.getCacheFilePath());
    fsExtra.writeFileSync(lockFilePath, primaryLockFileContent);
  });

  test('not loadCache if no cached before', () => {
    const mockFn = jest.fn();
    depInfo.moduleGraph.restore = mockFn;
    depInfo.loadCache();
    expect(mockFn).not.toBeCalled();
  });

  test('call moduleGraph.restore if no changed happen in lockfile', () => {
    depInfo.writeCache();
    const mockFn = jest.fn();
    depInfo.moduleGraph.restore = mockFn;
    depInfo.loadCache();
    expect(mockFn).toBeCalled();
  });

  test('not used previous cache if lockfile changed', () => {
    depInfo.writeCache();
    fsExtra.writeFileSync(lockFilePath, primaryLockFileContent.repeat(2));
    const mockFn = jest.fn();
    depInfo.moduleGraph.restore = mockFn;
    depInfo.loadCache();
    expect(mockFn).not.toBeCalled();
  });
});
