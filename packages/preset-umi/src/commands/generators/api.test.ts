import { generateApiResKV } from './api';

test('api name: foo', () => {
  expect(generateApiResKV('foo')).toEqual({
    key: '"foo"',
    value: '"is working"',
  });
});

test('api name: bar/boo', () => {
  expect(generateApiResKV('bar/foo')).toEqual({
    key: '"foo"',
    value: '"is working"',
  });
});

test('api name: foo/[id]', () => {
  expect(generateApiResKV('foo/[id]')).toEqual({
    key: '"fooId"',
    value: 'req.params["id"]',
  });
});

test('api name: [param]', () => {
  expect(generateApiResKV('[param]')).toEqual({
    key: '"param"',
    value: 'req.params["param"]',
  });
});

test('api name: long/nest/foo/[param]', () => {
  expect(generateApiResKV('long/nest/foo/[param]')).toEqual({
    key: '"fooParam"',
    value: 'req.params["param"]',
  });
});

test('api name: [ spaced ]', () => {
  expect(generateApiResKV('[ spaced ]')).toEqual({
    key: '"spaced"',
    value: 'req.params["spaced"]',
  });
});
