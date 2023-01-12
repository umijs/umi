import { toRemotesCodeString } from './mfUtils';

test('toRemote with aliasName', () => {
  expect(
    toRemotesCodeString([
      {
        entry: 'http://test.com/entry.js',
        aliasName: 'myRemote',
        name: '_long_remote_name',
      },
    ]),
  ).toMatchInlineSnapshot(`
    "myRemote: {
      aliasName: "myRemote",
      remoteName: "_long_remote_name",        
      entry: "http://test.com/entry.js"
    }"
  `);
});

test('toRemote without aliasName', () => {
  expect(
    toRemotesCodeString([
      {
        entry: 'http://test.com/entry.js',
        name: '_long_remote_name',
      },
    ]),
  ).toMatchInlineSnapshot(`
    "_long_remote_name: {
      aliasName: "_long_remote_name",
      remoteName: "_long_remote_name",        
      entry: "http://test.com/entry.js"
    }"
  `);
});

test('toRemote with entries', () => {
  expect(
    toRemotesCodeString([
      {
        entries: {
          DEV: 'http://dev.com/entry.js',
          PROD: 'http://prod.com/entry.js',
        },

        keyResolver: `(()=>'DEV')()`,
        name: 'mf',
      },
    ]),
  ).toMatchInlineSnapshot(`
    "mf: {
      aliasName: "mf",
      remoteName: "mf",        
      entry: ({"DEV":"http://dev.com/entry.js","PROD":"http://prod.com/entry.js"})[(()=>'DEV')()]
    }"
  `);
});

test('toRemote with multi remotes', () => {
  expect(
    toRemotesCodeString([
      {
        entry: 'http://entry1.js',
        aliasName: 'r1',
        name: 'mf1',
      },

      {
        entry: 'http://entry2.js',
        aliasName: 'r2',
        name: 'mf2',
      },
    ]),
  ).toMatchInlineSnapshot(`
    "r1: {
      aliasName: "r1",
      remoteName: "mf1",        
      entry: "http://entry1.js"
    },
    r2: {
      aliasName: "r2",
      remoteName: "mf2",        
      entry: "http://entry2.js"
    }"
  `);
});
