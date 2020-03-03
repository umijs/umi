import { join } from 'path';
import getPkg from './getPkg';

const fixtures = join(__dirname, 'fixtures');

test('normal', () => {
  const pkg = getPkg(join(fixtures, 'normal'));
  expect(pkg.name).toEqual('normal');
});

test('null while no package.json found in specific dir', () => {
  const pkg = getPkg(fixtures);
  expect(pkg).toEqual(null);
});
