import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { generateBuildManifestFromStats } from './utils';

function createApi(cwd: string, absOutputPath: string) {
  return {
    cwd,
    paths: {
      absOutputPath,
    },
    userConfig: {
      publicPath: '/',
    },
  } as any;
}

test('generateBuildManifestFromStats adds umi.css alias for utoopack css assets', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'umi-ssr-manifest-'));
  const absOutputPath = join(cwd, 'dist');
  mkdirSync(absOutputPath);

  try {
    generateBuildManifestFromStats(createApi(cwd, absOutputPath), {
      entrypoints: {
        umi: {
          assets: [{ name: 'umi.js' }],
          chunks: ['umi.js'],
        },
      },
      chunks: [{ id: 'umi.js', files: ['umi.js'] }],
      assets: [
        { name: 'umi.js' },
        { name: 'src_pages_c700bf89.css' },
        { name: 'src_pages_index_css_b574e1f9.async.js.single.css' },
        { name: 'src_pages_c700bf89.css.map' },
      ],
    });

    const manifest = JSON.parse(
      readFileSync(join(absOutputPath, 'build-manifest.json'), 'utf-8'),
    );

    expect(manifest.assets['umi.css']).toEqual(['/src_pages_c700bf89.css']);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('generateBuildManifestFromStats prefers umi css assets', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'umi-ssr-manifest-'));
  const absOutputPath = join(cwd, 'dist');
  mkdirSync(absOutputPath);

  try {
    generateBuildManifestFromStats(createApi(cwd, absOutputPath), {
      entrypoints: {
        umi: {
          assets: [{ name: 'umi.abc123ef.css' }, { name: 'umi.js' }],
          chunks: [],
        },
      },
      assets: [{ name: 'fallback.css' }, { name: 'umi.abc123ef.css' }],
    });

    const manifest = JSON.parse(
      readFileSync(join(absOutputPath, 'build-manifest.json'), 'utf-8'),
    );

    expect(manifest.assets['umi.css']).toEqual([
      '/umi.abc123ef.css',
      '/fallback.css',
    ]);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('maps same-name, same-size assets to their own emitted contents', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'umi-ssr-manifest-'));
  const dist = join(cwd, 'dist');
  try {
    mkdirSync(dist);
    for (const [dir, bytes] of [
      ['light', 'aa'],
      ['dark', 'bb'],
      ['unused', 'cc'],
    ]) {
      mkdirSync(join(cwd, dir));
      writeFileSync(join(cwd, dir, 'logo.png'), bytes);
    }
    writeFileSync(join(dist, 'logo.11111111.png'), 'aa');
    writeFileSync(join(dist, 'logo.22222222.png'), 'bb');

    generateBuildManifestFromStats(createApi(cwd, dist), {
      assets: ['logo.11111111.png', 'logo.22222222.png'],
    });
    const { assets } = JSON.parse(
      readFileSync(join(dist, 'build-manifest.json'), 'utf8'),
    );
    expect(assets['light/logo.png']).toBe('/logo.11111111.png');
    expect(assets['dark/logo.png']).toBe('/logo.22222222.png');
    expect(assets['unused/logo.png']).toBeUndefined();
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
