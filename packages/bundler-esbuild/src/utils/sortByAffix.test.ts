import { sortByAffix } from './sortByAffix';

test('normal', () => {
  const keys = sortByAffix({ arr: ['0', 'a$', 'b', 'c$'], affix: '$' });
  expect(keys).toEqual(['a$', 'c$', '0', 'b']);
});
