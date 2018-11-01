import generateWebManifest, {
  prependPublicPath,
  DEFAULT_MANIFEST_FILENAME,
} from '../src/plugins/pwa/generateWebManifest';
import { join } from 'path';

const APIMock = {
  config: {
    publicPath: '/',
  },
  log: {
    warn: () => {},
  },
  paths: {
    absSrcPath: join(__dirname, 'pwa'),
  },
  addHTMLLink: () => {},
  addHTMLHeadScript: () => {},
  addPageWatcher: () => {},
  onGenerateFiles: cb => {
    cb && cb();
  },
};

describe('generateWebManifest', () => {
  it('should prepend publicPath to srcpath', () => {
    expect(prependPublicPath('http://cdn.com/foo/bar/', './logo.png')).toBe(
      'http://cdn.com/foo/bar/logo.png',
    );
  });

  it('should use manifest provided by user', () => {
    const manifestPathProvidedByUser = join(
      __dirname,
      'pwa',
      'manifest.webmanifest',
    );
    const { srcPath, outputPath } = generateWebManifest(APIMock, {
      srcPath: manifestPathProvidedByUser,
    });
    expect(srcPath).toBe(manifestPathProvidedByUser);
    expect(outputPath).toBe('manifest.webmanifest');
  });

  it('should use a default manifest if not provided by user', () => {
    const { srcPath, outputPath } = generateWebManifest(APIMock);
    expect(srcPath).toBe(
      join(APIMock.paths.absSrcPath, DEFAULT_MANIFEST_FILENAME),
    );
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
