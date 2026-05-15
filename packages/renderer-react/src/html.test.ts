import { getClientCssPaths } from './html';

test('getClientCssPaths returns umi.css when available', () => {
  expect(
    getClientCssPaths({
      assets: {
        'umi.css': '/umi.css',
        'page.css': '/page.css',
      },
    }),
  ).toEqual(['/umi.css']);
});

test('getClientCssPaths supports utoopack css asset names', () => {
  expect(
    getClientCssPaths({
      assets: {
        'umi.js': '/umi.js',
        'src_pages_c700bf89.css': '/src_pages_c700bf89.css',
        'src_pages_index_css_b574e1f9.async.js.single.css':
          '/src_pages_index_css_b574e1f9.async.js.single.css',
        'src_pages_c700bf89.css.map': '/src_pages_c700bf89.css.map',
      },
    }),
  ).toEqual(['/src_pages_c700bf89.css']);
});

test('getClientCssPaths keeps multiple client css assets', () => {
  expect(
    getClientCssPaths({
      assets: {
        'a.css': '/a.css',
        'b.css': '/b.css',
      },
    }),
  ).toEqual(['/a.css', '/b.css']);
});
