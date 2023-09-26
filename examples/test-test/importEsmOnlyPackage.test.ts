// @ts-ignore
import x from './esm_only_pkg';

test('import from esm only pkg', () => {
  expect(x).toEqual('in_esm_only_pkg');
});
