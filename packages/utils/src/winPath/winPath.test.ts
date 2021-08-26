import { winPath } from './winPath';

test('normal', () => {
  expect(winPath('\\a\\b')).toEqual('/a/b');
  expect(winPath('/a/b')).toEqual('/a/b');
  expect(winPath('\\a\\b')).toEqual('/a/b');
});

test('Chinese', () => {
  expect(winPath('\\你好\\欢迎')).toEqual('/你好/欢迎');
  expect(winPath('\\你好欢迎')).toEqual('/你好欢迎');
  expect(winPath('你好\\欢迎')).toEqual('你好/欢迎');
});

test('Special characters', () => {
  expect(winPath('\\$\\%')).toEqual('/$/%');
  expect(winPath('\\next\\test\\read')).toEqual('/next/test/read');
});

test('not convert extended-length paths', () => {
  const path = '\\\\?\\c:\\aaaa\\bbbb';
  expect(winPath(path)).toEqual(path);
});
