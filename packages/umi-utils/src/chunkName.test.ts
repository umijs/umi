import chunkName from './chunkName';

test('normal', () => {
  expect(chunkName('/a/b', '/a/b/c.js')).toEqual('c.js');
  expect(chunkName('/a', '/a/b/c.js')).toEqual('b__c.js');
});

test('winPath', () => {
  expect(chunkName('\\a\\b', '/a/b/c.js')).toEqual('c.js');
  expect(chunkName('/a/b', '\\a\\b\\c.js')).toEqual('c.js');
  expect(chunkName('\\a\\b', '\\a\\b\\c.js')).toEqual('c.js');
});

test('ignore start src', () => {
  expect(chunkName('/a/b', '/a/b/src/c.js')).toEqual('c.js');
  expect(chunkName('/a/b', '/a/b/d/src/c.js')).toEqual('d__src__c.js');
});

test('alias start page and pages', () => {
  expect(chunkName('/a/b', '/a/b/pages/c.js')).toEqual('p__c.js');
  expect(chunkName('/a/b', '/a/b/page/c.js')).toEqual('p__c.js');
  expect(chunkName('/a/b', '/a/b/src/page/c.js')).toEqual('p__c.js');
  expect(chunkName('/a/b', '/a/b/d/page/c.js')).toEqual('d__page__c.js');
});
