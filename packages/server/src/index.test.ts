import { createProxyMiddleware } from './index';

test('export httpProxyMiddleware', () => {
  expect(typeof createProxyMiddleware).toEqual('function');
});
