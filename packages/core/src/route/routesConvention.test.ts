import { join } from 'path';
import { getRoutes } from './routesConvention';

const fixtures = join(__dirname, '../../fixtures/route');

test('normal', () => {
  getRoutes({
    base: join(fixtures, 'convention-a/pages'),
  });
});
