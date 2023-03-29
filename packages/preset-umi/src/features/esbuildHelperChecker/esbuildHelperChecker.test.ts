import { getGlobalVars } from './esbuildHelperChecker';

test('getGlobalVars', async () => {
  const vars = await getGlobalVars({
    content: `
var a = 1;
var b = 2, c = 3;
function d() {
  var e = 4;
}
    `,
  });
  expect(vars).toEqual(['a', 'b', 'c']);
});
