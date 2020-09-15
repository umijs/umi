import isEqual from './isEqual';

test('normal', () => {
  expect(isEqual(1, 1)).toEqual(true);
  expect(isEqual(['a'], ['a'])).toEqual(true);
  expect(isEqual({ foo: 'bar' }, { foo: 'bar' })).toEqual(true);
});

test('function', () => {
  expect(
    isEqual(
      function () {
        alert(1);
      },
      function () {
        alert(1);
      },
    ),
  ).toEqual(true);
});

test('function with reference', () => {
  expect(
    isEqual(
      function () {
        alert(1);
      },
      function () {
        alert(1);
      },
    ),
  ).toEqual(true);
});

test('function in object', () => {
  expect(
    isEqual(
      {
        foo: function () {
          alert(1);
        },
        bar: 2,
      },
      {
        foo: function () {
          alert(1);
        },
        bar: 2,
      },
    ),
  ).toEqual(true);
});

test('false', () => {
  expect(isEqual(false, undefined)).toEqual(false);
});
