import { isUtoopackProxyStartupError } from './index';

describe('isUtoopackProxyStartupError', () => {
  test('matches ECONNREFUSED from the utoopack dev server port', () => {
    expect(
      isUtoopackProxyStartupError(
        {
          code: 'ECONNREFUSED',
          address: '127.0.0.1',
          port: 8001,
        },
        8001,
      ),
    ).toBe(true);
  });

  test('does not match other ports', () => {
    expect(
      isUtoopackProxyStartupError(
        {
          code: 'ECONNREFUSED',
          address: '127.0.0.1',
          port: 9001,
        },
        8001,
      ),
    ).toBe(false);
  });

  test('does not match other proxy errors', () => {
    expect(
      isUtoopackProxyStartupError(
        {
          code: 'ECONNRESET',
          address: '127.0.0.1',
          port: 8001,
        },
        8001,
      ),
    ).toBe(false);
  });
});
