import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join, relative } from 'path';
import { resolveAssetPath } from './assetPath';

describe('MFSU asset paths', () => {
  let workspace: string;
  let output: string;
  let sibling: string;

  beforeAll(() => {
    workspace = mkdtempSync(join(tmpdir(), 'mfsu-assets-'));
    output = join(workspace, 'dist');
    sibling = join(workspace, 'dist-other');
    mkdirSync(join(output, 'chunks'), { recursive: true });
    mkdirSync(sibling);
    writeFileSync(join(output, 'chunks', 'asset name.js'), 'generated');
    writeFileSync(join(sibling, 'asset.js'), 'fixture');
    symlinkSync(join(output, 'chunks'), join(output, 'local'), 'junction');
    symlinkSync(join(output, 'chunks'), join(output, '.local'), 'junction');
    symlinkSync(sibling, join(output, 'external'), 'junction');
  });

  afterAll(() => {
    rmSync(workspace, { recursive: true, force: true });
  });

  test('resolves an encoded asset name and an in-output alias', () => {
    const file = realpathSync(join(output, 'chunks', 'asset name.js'));
    expect(resolveAssetPath(output, 'chunks/asset%20name.js')?.file).toBe(file);
    expect(resolveAssetPath(output, 'local/asset%20name.js')?.file).toBe(file);
  });

  test('requires both the requested path and the resolved target to belong to the output', () => {
    const otherFile = join(sibling, 'asset.js');
    expect(
      resolveAssetPath(output, relative(output, otherFile)),
    ).toBeUndefined();
    expect(resolveAssetPath(output, otherFile)).toBeUndefined();
    expect(resolveAssetPath(output, 'external/asset.js')).toBeUndefined();
  });

  test('keeps hidden alias names private for fallback requests', () => {
    expect(
      resolveAssetPath(output, '.local/asset%20name.js', 'ignore'),
    ).toBeUndefined();
  });

  test.each(['missing.js', '%', 'asset%00.js'])(
    'ignores an unavailable or invalid asset %s',
    (asset) => {
      expect(resolveAssetPath(output, asset)).toBeUndefined();
    },
  );
});
