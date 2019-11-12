import { findIndex } from './util';

test('findIndex 0', () => {
  expect(findIndex([1, 2, 1, 2], 0, () => {})).toEqual(0);
});

test('findIndex 1', () => {
  expect(findIndex([1, 2, 1, 2], 1, el => el === 1)).toEqual(1);
});

test('findIndex 2', () => {
  expect(findIndex([1, 2, 1, 2], 2, el => el === 1)).toEqual(3);
});

test('findIndex throw error', () => {
  expect(() => {
    findIndex([1, 2, 1, 2], 3, el => el === 1);
  }).toThrow(/Invalid find index params/);
});
