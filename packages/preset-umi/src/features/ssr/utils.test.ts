import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
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
  const prefix = Buffer.alloc(128 * 1024);
  const light = Buffer.concat([prefix, Buffer.from('aa')]);
  const dark = Buffer.concat([prefix, Buffer.from('bb')]);
  try {
    mkdirSync(dist);
    for (const [dir, bytes] of [
      ['light', light],
      ['dark', dark],
      ['unused', Buffer.concat([prefix, Buffer.from('cc')])],
    ] as const) {
      mkdirSync(join(cwd, dir));
      writeFileSync(join(cwd, dir, 'logo.png'), bytes);
    }
    writeFileSync(join(dist, 'logo.11111111.png'), light);
    writeFileSync(join(dist, 'logo.22222222.png'), dark);

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

test('does not use a directory as an emitted asset', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'umi-ssr-manifest-'));
  const dist = join(cwd, 'dist');
  const emitted = join(dist, 'logo.11111111.png');
  try {
    mkdirSync(emitted, { recursive: true });
    writeFileSync(join(cwd, 'logo.png'), Buffer.alloc(statSync(emitted).size));

    generateBuildManifestFromStats(createApi(cwd, dist), {
      assets: ['logo.11111111.png'],
    });
    const { assets } = JSON.parse(
      readFileSync(join(dist, 'build-manifest.json'), 'utf8'),
    );
    expect(assets['logo.png']).toBeUndefined();
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

// Creating file symlinks on Windows depends on the runner's privileges.
const testFileSymlinks = process.platform === 'win32' ? test.skip : test;

testFileSymlinks('keeps resolved asset matches inside their roots', () => {
  const temp = mkdtempSync(join(tmpdir(), 'umi-ssr-manifest-'));
  const cwd = join(temp, 'project');
  const dist = join(cwd, 'dist');
  const localOutput = join(dist, 'emitted.png');
  const siblingSource = join(temp, 'shared.png');
  const siblingOutput = join(temp, 'output.png');
  try {
    for (const dir of ['light', 'dark', 'linked', 'shared', 'dist']) {
      mkdirSync(join(cwd, dir), { recursive: true });
    }
    writeFileSync(siblingSource, 'aa');
    writeFileSync(siblingOutput, 'bb');
    writeFileSync(join(cwd, 'light', 'logo.png'), 'aa');
    writeFileSync(join(cwd, 'dark', 'logo.png'), 'bb');
    writeFileSync(localOutput, 'aa');
    symlinkSync(
      join(cwd, 'light', 'logo.png'),
      join(cwd, 'linked', 'logo.png'),
    );
    symlinkSync(siblingSource, join(cwd, 'shared', 'logo.png'));
    symlinkSync(localOutput, join(dist, 'logo.11111111.png'));
    symlinkSync(siblingOutput, join(dist, 'logo.22222222.png'));

    generateBuildManifestFromStats(createApi(cwd, dist), {
      assets: ['logo.11111111.png', 'logo.22222222.png'],
    });
    const { assets } = JSON.parse(
      readFileSync(join(dist, 'build-manifest.json'), 'utf8'),
    );

    expect(assets['light/logo.png']).toBe('/logo.11111111.png');
    expect(assets['linked/logo.png']).toBe('/logo.11111111.png');
    expect(assets['dark/logo.png']).toBeUndefined();
    expect(assets['shared/logo.png']).toBeUndefined();
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
