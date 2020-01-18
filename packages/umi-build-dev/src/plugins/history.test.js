import { getHistoryConfigString } from './history';

it('string', () => {
  const optString = getHistoryConfigString({
    basename: '/app',
  });
  expect(optString).toBe("{basename: '/app'}");
});

it('strings', () => {
  const optString = getHistoryConfigString({
    basename: '/app',
    hashType: 'slash',
  });
  expect(optString).toMatch(/{basename: '\/app',(\s)*hashType: 'slash'}/);
});

it('number and bool', () => {
  const optString = getHistoryConfigString({
    forceRefresh: false,
    keyLength: 6,
  });
  // not: {forceRefresh: 'false',keyLength: "6"}
  expect(optString).toMatch(/{forceRefresh: false,(\s)*keyLength: 6}/);
});

it('function', () => {
  const optString = getHistoryConfigString({
    getUserConfirmation: () => {},
  });
  // not: {getUserConfirmation: "() => {}"} or {getUserConfirmation: "function getUserConfirmation() {}"}
  expect(optString).toBe('{getUserConfirmation: function getUserConfirmation() {}}');
});

it('getUserConformation', () => {
  const optString = getHistoryConfigString(
    {
      getUserConfirmation: './componets/LeavePrompt',
    },
    '$(absSrcPath)',
  );
  expect(optString).toBe(
    "{getUserConfirmation: require('$(absSrcPath)/componets/LeavePrompt').default}",
  );
});

it('other', () => {
  const optString = getHistoryConfigString(
    {
      initialEntries: ['/'],
      getUserConfirmation: null,
    },
    '$(absSrcPath)',
  );
  // not: {initialEntries: "['/']", getUserConfirmation: null} or {initialEntries: "/", getUserConfirmation: null}
  expect(optString).toMatch(/{initialEntries: \["\/"\],(\s)*getUserConfirmation: undefined}/);
});

it('extra', () => {
  const optString = getHistoryConfigString({}, '$(absSrcPath)', [
    'initialEntries: window.g_initialEntries',
  ]);
  // not: {initialEntries: 'window.g_initialEntries'}
  expect(optString).toBe('{initialEntries: window.g_initialEntries}');
});
