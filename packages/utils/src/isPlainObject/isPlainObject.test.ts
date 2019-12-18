import isPlainObject from './isPlainObject';

test('should return `true` if the object is created by the `Object` constructor.', () => {
  expect(isPlainObject(Object.create({}))).toEqual(true);
  expect(isPlainObject(Object.create(Object.prototype))).toEqual(true);
  expect(isPlainObject({ foo: 'bar' })).toEqual(true);
  expect(isPlainObject({})).toEqual(true);
});

test('should return `false` if the object is not created by the `Object` constructor.', () => {
  function Foo() {
    // @ts-ignore
    this.abc = {};
  }

  expect(!isPlainObject(/foo/)).toEqual(true);
  expect(!isPlainObject(function() {})).toEqual(true);
  expect(!isPlainObject(1)).toEqual(true);
  expect(!isPlainObject(['foo', 'bar'])).toEqual(true);
  expect(!isPlainObject([])).toEqual(true);
  // @ts-ignore
  expect(!isPlainObject(new Foo())).toEqual(true);
  expect(!isPlainObject(null)).toEqual(true);
  expect(!isPlainObject(Object.create(null))).toEqual(true);
});
