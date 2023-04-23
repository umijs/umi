import { join } from 'path';
import { getMockData } from './getMockData';

const fixtures = join(__dirname, './fixtures');

test('normal', () => {
  const ret = getMockData({
    cwd: join(fixtures, 'normal'),
    mockConfig: {},
  });
  expect(Object.keys(ret)).toEqual(['GET /api/a', 'GET /api/b', 'GET /api/c']);
});
