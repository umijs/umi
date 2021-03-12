import { join } from 'path';
import { getCredentials } from './utils';

jest.mock('fs', () => ({
  readFileSync(filename: string) {
    return filename;
  },
}));

describe('ServerUtils', () => {
  describe('getCredentials', () => {
    let spyError: any;
    beforeAll(() => {
      spyError = jest
        .spyOn(global.console, 'error')
        .mockImplementation(() => {});
    });

    afterAll(() => {
      spyError.mockRestore();
    });

    it('getCredentials error', () => {
      expect(() => getCredentials({})).toThrowError(
        /Both options\.https\.key and options\.https\.cert are required\./,
      );
    });

    it('getCredentials normal', () => {
      expect(
        getCredentials({
          https: {
            key: '/tmp/key.pem',
            cert: '/tmp/cert.pem',
          },
        }),
      ).toEqual({
        key: '/tmp/key.pem',
        cert: '/tmp/cert.pem',
      });
    });

    it('getCredentials ca', () => {
      expect(
        getCredentials({
          https: {
            key: '/tmp/key.pem',
            cert: '/tmp/cert.pem',
            ca: '/tmp/ca.pem',
          },
        }),
      ).toEqual({
        key: '/tmp/key.pem',
        cert: '/tmp/cert.pem',
        ca: ['/tmp/ca.pem'],
      });
    });

    it('getCredentials default', () => {
      expect(
        getCredentials({
          https: true,
        }),
      ).toEqual({
        key: join(__dirname, 'cert', 'key.pem'),
        cert: join(__dirname, 'cert', 'cert.pem'),
      });
    });
  });
});
