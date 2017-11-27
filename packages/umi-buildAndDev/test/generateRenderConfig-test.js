import expect from 'expect';
import { getRenderConfig } from '../src/generateRenderConfig';

describe('getRenderConfig', () => {
  it('normal', () => {
    const config = getRenderConfig({
      '/detail.html': 'detail/page.js',
      '/index.html': 'index.js',
      '/users/list.html': 'users/list.js',
    });
    expect(config).toEqual({
      pages: {
        'index.html': {
          template: 'index.html',
          data: '{}',
        },
        'detail.html': {
          template: 'detail.html',
          data: '{}',
        },
        'users/list.html': {
          template: 'users/list.html',
          data: '{}',
        },
      },
    });
  });
});
