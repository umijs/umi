import { getUserConfigWithKey, updateUserConfigWithKey } from './configUtils';

test('getUserConfigWithKey', () => {
  expect(
    getUserConfigWithKey({
      key: 'foo',
      userConfig: {},
    }),
  ).toEqual(undefined);

  expect(
    getUserConfigWithKey({
      key: 'foo',
      userConfig: { foo: 1 },
    }),
  ).toEqual(1);

  expect(
    getUserConfigWithKey({
      key: 'foo',
      userConfig: { foo: false },
    }),
  ).toEqual(false);
});

test('getUserConfigWithKey with dotted key', () => {
  expect(
    getUserConfigWithKey({
      key: 'foo.bar',
      userConfig: {},
    }),
  ).toEqual(undefined);

  expect(
    getUserConfigWithKey({
      key: 'foo.bar',
      userConfig: { foo: { bar: 1 } },
    }),
  ).toEqual(1);
});

test('updateUserConfigWithKey', () => {
  const userConfig = {};
  updateUserConfigWithKey({
    key: 'foo',
    value: 1,
    userConfig,
  });
  expect(userConfig).toEqual({ foo: 1 });
});

test('updateUserConfigWithKey with dotted key', () => {
  const userConfig = {};
  updateUserConfigWithKey({
    key: 'foo.bar',
    value: 1,
    userConfig,
  });
  expect(userConfig).toEqual({ foo: { bar: 1 } });
});
