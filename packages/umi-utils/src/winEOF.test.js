import winEOF from './winEOF';

const isWindows = typeof process !== 'undefined' && process.platform === 'win32';

test('normal', () => {
  if (isWindows) {
    expect(winEOF('a \r\n b')).toEqual('a \n b');
    expect(winEOF('成 \r\n b')).toEqual('成 \n b');
    expect(winEOF('🍟 \r\n 🍔')).toEqual('🍟 \n 🍔');
  } else {
    expect(winEOF('a \n b')).toEqual('a \n b');
    expect(winEOF('成 \n b')).toEqual('成 \n b');
    expect(winEOF('🍟 \n 🍔')).toEqual('🍟 \n 🍔');
  }
});
