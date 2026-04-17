import { stripAnsi } from '@umijs/utils';
import { getBuildBanner, getDevBanner } from './util';

describe('getDevBanner', () => {
  const originalVersion = process.env.UTOOPACK_VERSION;

  afterEach(() => {
    if (originalVersion) {
      process.env.UTOOPACK_VERSION = originalVersion;
    } else {
      delete process.env.UTOOPACK_VERSION;
    }
  });

  test('prints the utoopack ready banner in vite style', () => {
    const banner = stripAnsi(
      getDevBanner({
        protocol: 'http:',
        host: '0.0.0.0',
        port: 8000,
        ip: '30.172.96.210',
        packVersion: '1.3.11',
        duration: 1289,
      }),
    );

    expect(banner).toContain('utoo pack v1.3.11 ready in 1289ms');
    expect(banner).toContain('➜  Local:   http://localhost:8000');
    expect(banner).toContain('➜  Network: http://30.172.96.210:8000');
  });

  test('prints the utoopack build banner in a concise style', () => {
    const banner = stripAnsi(
      getBuildBanner({
        packVersion: '1.3.11',
        duration: 2345,
        outputPath: 'dist',
        assetCount: 6,
      }),
    );

    expect(banner).toContain('utoo pack v1.3.11 built in 2345ms');
    expect(banner).toContain('➜  Output:  dist');
    expect(banner).toContain('➜  Assets:  6 files');
  });
});
