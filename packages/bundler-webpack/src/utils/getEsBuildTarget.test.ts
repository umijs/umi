import { getEsBuildTarget } from './getEsBuildTarget';

test('normal', () => {
  expect(
    getEsBuildTarget({
      targets: { chrome: 80 },
    }),
  ).toEqual(['chrome80']);
});

test('not ie', () => {
  expect(
    getEsBuildTarget({
      targets: { chrome: 80, ie: 8, edge: 11 },
    }),
  ).toEqual(['chrome80', 'edge11']);
});
