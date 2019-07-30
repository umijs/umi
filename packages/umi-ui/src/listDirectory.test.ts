import { join } from 'path';
import listDirectory from './listDirectory';

test('normal', () => {
  const res = listDirectory(join(__dirname, 'fixtures/listDirectory/normal'));
  expect(res).toEqual([
    { type: 'directory', fileName: 'b' },
    { type: 'directory', fileName: 'e.js' },
    { type: 'file', fileName: 'd.css' },
    { type: 'file', fileName: 'c.js' },
    { type: 'file', fileName: 'a' },
  ]);
});

test('show hidden', () => {
  const res = listDirectory(join(__dirname, 'fixtures/listDirectory/normal'), {
    showHidden: true,
  });
  expect(res).toEqual([
    { type: 'directory', fileName: 'b' },
    { type: 'directory', fileName: 'e.js' },
    { type: 'file', fileName: 'd.css' },
    { type: 'file', fileName: 'c.js' },
    { type: 'file', fileName: 'a' },
    { type: 'file', fileName: '.f' },
  ]);
});

test('directory only', () => {
  const res = listDirectory(join(__dirname, 'fixtures/listDirectory/normal'), {
    directoryOnly: true,
  });
  expect(res).toEqual([
    { type: 'directory', fileName: 'b' },
    { type: 'directory', fileName: 'e.js' },
  ]);
});
