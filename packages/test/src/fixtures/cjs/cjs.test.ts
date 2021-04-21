// @ts-ignore
import { foo } from './foo.cjs';
// @ts-ignore
import { bar } from './bar.mjs';
// @ts-ignore
import * as unknown from './unknown.xjs';

test('cjs/mjs file', () => {
  expect(foo).toEqual('foo');
  expect(bar).toEqual('bar');
  expect(unknown).toEqual({ default: 'unknown.xjs' });
});
