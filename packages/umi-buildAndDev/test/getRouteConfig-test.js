import expect from 'expect';
import { join } from 'path';
import getRouteConfig from '../src/getRouteConfig';

const fixture = join(__dirname, 'fixtures/getRouteConfig');

describe('getRouteConfig', () => {
  it('normal', () => {
    const config = getRouteConfig(join(fixture, 'normal'));
    expect(config).toEqual({
      '/detail.html': 'detail/page.js',
      '/index.html': 'index.js',
      '/users/list.html': 'users/list.js',
    });
  });

  it('conflicts', () => {
    expect(() => {
      getRouteConfig(join(fixture, 'conflicts'));
    }).toThrow(/路由冲突/);
  });
});
