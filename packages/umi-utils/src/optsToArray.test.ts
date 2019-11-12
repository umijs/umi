import optsToArray from './optsToArray';

describe('optsToArray', () => {
  test('null or undefined', () => {
    expect(optsToArray()).toEqual([]);
    expect(optsToArray(null)).toEqual([]);
  });

  test('array', () => {
    expect(optsToArray([1])).toEqual([1]);
  });

  test('not array', () => {
    expect(optsToArray(1)).toEqual([1]);
    expect(optsToArray(0)).toEqual([0]);
    expect(optsToArray(false)).toEqual([false]);
    expect(optsToArray('foo')).toEqual(['foo']);
    expect(optsToArray({ a: 'b' })).toEqual([{ a: 'b' }]);
  });
});
