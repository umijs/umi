import { getFaviconPath } from './favicon';

test('favicon path', () => {
  expect(getFaviconPath('/assets/favicon.ico')).toBe('/assets/favicon.ico');
  expect(getFaviconPath('https://cdn/favicon.ico')).toBe(
    'https://cdn/favicon.ico',
  );

  expect(getFaviconPath('/assets/favicon.ico', '/path/')).toBe(
    '/path/assets/favicon.ico',
  );
  expect(getFaviconPath('https://cdn/favicon.ico', '/path/')).toBe(
    'https://cdn/favicon.ico',
  );
});
