import winEOF from './winEOF';

test('normal', () => {
  expect(winEOF('a\r\nb')).toEqual('a\nb');
  expect(winEOF('成\r\nb')).toEqual('成\nb');
  expect(winEOF('🍟\r\n🍔')).toEqual('🍟\n🍔');
});
