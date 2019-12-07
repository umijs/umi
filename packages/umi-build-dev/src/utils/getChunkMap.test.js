import { isAssetsType, patchDataWithRoutes, getChunkAssetsMaps } from './getChunkMap';

describe('test getChunkMap utils', () => {
  const routes = [
    { path: '/home', exact: true, component: './pages/home/index.jsx' },
    {
      path: '/',
      exact: true,
      component: './pages/index.tsx',
    },
    { path: '/news/:id', exact: true, component: './pages/news/$id.tsx' },
  ];

  const chunkGroupData = [
    { name: 'umi', chunks: ['umi.baa67d11.css', 'umi.6791e2ab.js'] },
    {
      name: 'layouts__index',
      chunks: [
        'vendors.431f0bf4.chunk.css',
        'vendors.aed9ac63.async.js',
        'layouts__index.0ab34177.chunk.css',
        'layouts__index.12df59f1.async.js',
      ],
    },
    {
      name: 'p__home__index',
      chunks: [
        'vendors.431f0bf4.chunk.css',
        'vendors.aed9ac63.async.js',
        'p__home__index.1353f910.chunk.css',
        'p__home__index.6d1330b1.async.js',
      ],
    },
    {
      name: 'p__index',
      chunks: [
        'vendors.431f0bf4.chunk.css',
        'vendors.aed9ac63.async.js',
        'p__index.1353f910.chunk.css',
        'p__index.c2bcd95d.async.js',
      ],
    },
    {
      name: 'p__news___id',
      chunks: [
        'vendors.431f0bf4.chunk.css',
        'vendors.aed9ac63.async.js',
        'p__news___id.204a3fac.async.js',
      ],
    },
  ];

  describe('isAssetsType', () => {
    it('should test css', () => {
      expect(isAssetsType('css', 'umi.css')).toBeTruthy();
      expect(isAssetsType('css', 'umi.f4cb51da.css')).toBeTruthy();
      expect(isAssetsType('css', 'pages__index.5c0f5f51.async.css')).toBeTruthy();

      expect(isAssetsType('css', 'umi.js')).not.toBeTruthy();
    });

    it('should test js', () => {
      expect(isAssetsType('js', 'umi.js')).toBeTruthy();
      expect(isAssetsType('js', 'umi.f4cb51da.js')).toBeTruthy();
      expect(isAssetsType('js', 'pages__index.5c0f5f51.async.js')).toBeTruthy();

      expect(isAssetsType('js', 'umi.css')).not.toBeTruthy();
    });

    it('should test customRule', () => {
      const customRule = /\.(png|jpg|jpeg|gif)$/;
      expect(isAssetsType(customRule, 'a.png')).toBeTruthy();
      expect(isAssetsType(customRule, 'a.jpg', customRule)).toBeTruthy();
      expect(isAssetsType(customRule, 'a.jpg', customRule)).toBeTruthy();
      expect(isAssetsType(customRule, 'a.css', customRule)).not.toBeTruthy();
    });
  });

  describe('patchDataWithRoutes', () => {
    it('should patchDataWithRoutes normal', () => {
      const routesAssets = {};
      patchDataWithRoutes(routesAssets, routes, chunkGroupData);
      expect(routesAssets).toEqual({
        '/home': [
          'umi.baa67d11.css',
          'umi.6791e2ab.js',
          'vendors.431f0bf4.chunk.css',
          'vendors.aed9ac63.async.js',
          'p__home__index.1353f910.chunk.css',
          'p__home__index.6d1330b1.async.js',
        ],
        '/': [
          'umi.baa67d11.css',
          'umi.6791e2ab.js',
          'vendors.431f0bf4.chunk.css',
          'vendors.aed9ac63.async.js',
          'p__index.1353f910.chunk.css',
          'p__index.c2bcd95d.async.js',
        ],
        '/news/:id': [
          'umi.baa67d11.css',
          'umi.6791e2ab.js',
          'vendors.431f0bf4.chunk.css',
          'vendors.aed9ac63.async.js',
          'p__news___id.204a3fac.async.js',
        ],
      });
    });

    it('should patchDataWithRoutes parentChunks', () => {
      const routesAssets = {};
      patchDataWithRoutes(routesAssets, routes, chunkGroupData, [
        'react.min.js',
        'react-dom.min.js',
      ]);
      expect(routesAssets).toEqual({
        '/home': [
          'react.min.js',
          'react-dom.min.js',
          'umi.baa67d11.css',
          'umi.6791e2ab.js',
          'vendors.431f0bf4.chunk.css',
          'vendors.aed9ac63.async.js',
          'p__home__index.1353f910.chunk.css',
          'p__home__index.6d1330b1.async.js',
        ],
        '/': [
          'react.min.js',
          'react-dom.min.js',
          'umi.baa67d11.css',
          'umi.6791e2ab.js',
          'vendors.431f0bf4.chunk.css',
          'vendors.aed9ac63.async.js',
          'p__index.1353f910.chunk.css',
          'p__index.c2bcd95d.async.js',
        ],
        '/news/:id': [
          'react.min.js',
          'react-dom.min.js',
          'umi.baa67d11.css',
          'umi.6791e2ab.js',
          'vendors.431f0bf4.chunk.css',
          'vendors.aed9ac63.async.js',
          'p__news___id.204a3fac.async.js',
        ],
      });
    });
  });

  describe('getChunkAssetsMaps', () => {
    it('getChunkAssetsMaps normal', () => {
      const assetsMap = getChunkAssetsMaps({
        '/home': [
          'umi.baa67d11.css',
          'umi.6791e2ab.js',
          'vendors.431f0bf4.chunk.css',
          'vendors.aed9ac63.async.js',
          'p__home__index.1353f910.chunk.css',
          'p__home__index.6d1330b1.async.js',
        ],
        '/': [
          'umi.baa67d11.css',
          'umi.6791e2ab.js',
          'vendors.431f0bf4.chunk.css',
          'vendors.aed9ac63.async.js',
          'p__index.1353f910.chunk.css',
          'p__index.c2bcd95d.async.js',
        ],
        '/news/:id': [
          'umi.baa67d11.css',
          'umi.6791e2ab.js',
          'vendors.431f0bf4.chunk.css',
          'vendors.aed9ac63.async.js',
          'p__news___id.204a3fac.async.js',
        ],
      });
      expect(assetsMap).toEqual({
        '/': {
          css: ['umi.baa67d11.css', 'vendors.431f0bf4.chunk.css', 'p__index.1353f910.chunk.css'],
          js: ['umi.6791e2ab.js', 'vendors.aed9ac63.async.js', 'p__index.c2bcd95d.async.js'],
        },
        '/home': {
          css: [
            'umi.baa67d11.css',
            'vendors.431f0bf4.chunk.css',
            'p__home__index.1353f910.chunk.css',
          ],
          js: ['umi.6791e2ab.js', 'vendors.aed9ac63.async.js', 'p__home__index.6d1330b1.async.js'],
        },
        '/news/:id': {
          css: ['umi.baa67d11.css', 'vendors.431f0bf4.chunk.css'],
          js: ['umi.6791e2ab.js', 'vendors.aed9ac63.async.js', 'p__news___id.204a3fac.async.js'],
        },
      });
    });
  });
});
