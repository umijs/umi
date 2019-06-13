import { join } from 'path';
import { findJS } from 'umi-utils';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import preRenderPlugin from '../src/index';

const uniq = require('lodash.uniq');

const absOutputPath = join(__dirname, 'examples');

const api = {
  onBuildSuccessAsync(fn) {
    fn();
  },
  findJS,
  _modifyConfig() {},
  paths: {
    absOutputPath,
  },
  config: {
    ssr: true,
  },
  routes: [
    {
      path: '/',
      component: './src/layout.js',
      routes: [
        {
          path: '/',
          exact: true,
          component: './src/pages/index.js',
          title: 'test page',
          Routes: ['src/pages/.umi-production/TitleWrapper.jsx'],
          _title: 'Index Page',
          _title_default: 'defaultPage',
        },
        {
          path: '/users',
          exact: true,
          component: './src/pages/users.js',
          _title: 'Users Page',
          _title_default: 'defaultPage',
        },
      ],
      _title: 'defaultPage',
      _title_default: 'defaultPage',
    },
  ],
  _: {
    uniq,
  },
  debug: info => {
    console.debug(info);
  },
};

describe('test plugin', () => {
  const indexPath = join(absOutputPath, 'index.html');
  const userPath = join(absOutputPath, 'users', 'index.html');

  const cleanDist = () => {
    if (existsSync(indexPath)) {
      unlinkSync(indexPath);
    }
    if (existsSync(userPath)) {
      unlinkSync(userPath);
    }
  };

  describe('throw error when not config ssr', () => {
    afterAll(() => {
      cleanDist();
    });
    test('throw error when not using ssr', async () => {
      expect(() => {
        preRenderPlugin({
          ...api,
          config: {},
        });
      }).toThrowError(/config must use { ssr: true } when using umi preRender plugin/);
    });
  });

  describe('normal', () => {
    beforeEach(() => {
      preRenderPlugin(api);
    });
    afterEach(() => {
      cleanDist();
    });
    test('render into dist normal', async () => {
      const indexHtml = readFileSync(indexPath, 'utf-8');
      const usersHtml = readFileSync(userPath, 'utf-8');

      expect(indexHtml).toEqual(
        `<div class="normal___1KW4T" data-reactroot=""><h1>Page index</h1><h2>csr: <!-- -->http://127.0.0.1:8000</h2></div>`,
      );
      expect(usersHtml).toEqual(
        `<div class="normal___1KMnC" data-reactroot=""><h1>Page users111</h1><h2>users</h2><ul><li>foo</li><li>bar</li></ul></div>`,
      );
    });
  });

  describe('exclude', () => {
    beforeEach(() => {
      preRenderPlugin(api, {
        exclude: ['/users'],
      });
    });
    afterEach(() => {
      cleanDist();
    });
    test('render into dist normal', async () => {
      const indexHtml = readFileSync(indexPath, 'utf-8');
      const hasUsers = existsSync(userPath);

      expect(indexHtml).toEqual(
        `<div class="normal___1KW4T" data-reactroot=""><h1>Page index</h1><h2>csr: <!-- -->http://127.0.0.1:8000</h2></div>`,
      );
      expect(hasUsers).toEqual(false);
    });
  });
});
