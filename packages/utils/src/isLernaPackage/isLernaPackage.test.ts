import { isLernaPackage } from '../index';
import { join } from 'path';

const fixtures = join(__dirname, 'fixtures');

test('is lerna', () => {
  expect(isLernaPackage(join(fixtures, 'is-lerna'))).toEqual(true);
});

test('is not lerna', () => {
  expect(isLernaPackage(join(fixtures, 'is-not-lerna'))).toEqual(false);
});
