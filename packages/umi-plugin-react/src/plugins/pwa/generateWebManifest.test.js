import { join } from 'path';
import { winPath } from 'umi-utils';

import generateWebManifest, {
  prependPublicPath,
  DEFAULT_MANIFEST_FILENAME,
} from './generateWebManifest';

const absSrcPath = winPath(join(__dirname, '../../../../umi/test/fixtures/build/pwa'));

const APIMock = {
  config: {
    publicPath: '/',
  },
  log: {
    warn: () => {},
  },
  paths: {
    absSrcPath,
  },
  addHTMLLink: () => {},
  addHTMLHeadScript: () => {},
  addPageWatcher: () => {},
  onGenerateFiles: cb => {
    if (cb) {
      cb();
    }
  },
};

describe('generateWebManifest', () => {
  it('should prepend publicPath to srcpath', () => {
    expect(prependPublicPath('http://cdn.com/foo/bar/', './logo.png')).toBe(
      'http://cdn.com/foo/bar/logo.png',
    );
  });

  it('should use manifest provided by user', () => {
    const manifestPathProvidedByUser = winPath(join(absSrcPath, 'manifest.webmanifest'));
    const { srcPath, outputPath } = generateWebManifest(APIMock, {
      srcPath: manifestPathProvidedByUser,
    });
    expect(winPath(srcPath)).toBe(manifestPathProvidedByUser);
    expect(outputPath).toBe('manifest.webmanifest');
  });

  it('should use a default manifest if not provided by user', () => {
    const manifestPath = winPath(join(APIMock.paths.absSrcPath, DEFAULT_MANIFEST_FILENAME));
    const { srcPath, outputPath } = generateWebManifest(APIMock);
    expect(winPath(srcPath)).toBe(manifestPath);
    expect(outputPath).toBe(DEFAULT_MANIFEST_FILENAME);
  });

  it('should use a default manifest if its path is non-exist', () => {
    const { srcPath, outputPath } = generateWebManifest(APIMock, {
      srcPath: 'non-exist',
    });
    expect(srcPath).toBe(null);
    expect(outputPath).toBe(DEFAULT_MANIFEST_FILENAME);
  });
});
