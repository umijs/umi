import { getBrowsersList } from './browsersList';

test('normal', () => {
  expect(
    getBrowsersList({
      targets: { ie: 8 },
    }),
  ).toEqual(['ie >= 8']);
});

test('targets.browsers', () => {
  expect(
    getBrowsersList({
      targets: { browsers: ['chrome >= 10'] },
    }),
  ).toEqual(['chrome >= 10']);
});
