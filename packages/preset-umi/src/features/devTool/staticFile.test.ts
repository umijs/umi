import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { resolveDevToolFile } from './devTool';

let cwd: string;
let root: string;

beforeEach(() => {
  cwd = realpathSync(mkdtempSync(join(tmpdir(), 'umi-dev-tool-')));
  root = join(cwd, 'dist');
  mkdirSync(join(root, 'assets'), { recursive: true });
  writeFileSync(join(root, 'assets', 'umi.css'), '');
  writeFileSync(join(root, 'index.html'), '');
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

test('resolves an installed DevTool asset', () => {
  expect(resolveDevToolFile(root, 'assets/umi.css')).toEqual({
    path: join('assets', 'umi.css'),
    root,
  });
});

test.each(['', 'routes/settings'])('uses the index for %p', (path) => {
  expect(resolveDevToolFile(root, path)).toEqual({
    path: 'index.html',
    root,
  });
});

test('reports a missing DevTool distribution', () => {
  expect(resolveDevToolFile(join(cwd, 'missing'), '')).toBeUndefined();
});

test('declines an asset resolving outside the physical distribution root', () => {
  const sharedAssets = join(cwd, 'shared-assets');
  mkdirSync(sharedAssets);
  writeFileSync(join(sharedAssets, 'umi.css'), '');
  symlinkSync(sharedAssets, join(root, 'shared'), 'junction');

  expect(resolveDevToolFile(root, 'shared/umi.css')).toBeNull();
});
