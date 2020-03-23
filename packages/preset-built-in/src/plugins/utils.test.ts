import fs from 'fs';
import { join } from 'path';
import { winPath } from '@umijs/utils';
import { getGlobalFile } from './utils';

test('getGlobalFile', () => {
  const existsSyncMock = jest
    .spyOn(fs, 'existsSync')
    .mockImplementation((res) => true);
  const files = getGlobalFile({
    files: ['global.ts', 'global.tsx', 'global.js'],
    absSrcPath: winPath(__dirname),
  });
  expect(files).toEqual([join(winPath(__dirname), 'global.ts')]);
  existsSyncMock.mockRestore();
});
