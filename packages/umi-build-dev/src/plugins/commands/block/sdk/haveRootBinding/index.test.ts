import haveRootBinding from './index';

test('import found', async () => {
  const ret = await haveRootBinding(
    `
import A from './A';
  `,
    'A',
  );
  expect(ret).toEqual(true);
});

test('import not found', async () => {
  const ret = await haveRootBinding(
    `
import A from './A';
  `,
    'B',
  );
  expect(ret).toEqual(false);
});

test('variable found', async () => {
  const ret = await haveRootBinding(
    `
const A = '';
  `,
    'A',
  );
  expect(ret).toEqual(true);
});

test('variable not found', async () => {
  const ret = await haveRootBinding(
    `
const A = '';
  `,
    'B',
  );
  expect(ret).toEqual(false);
});
