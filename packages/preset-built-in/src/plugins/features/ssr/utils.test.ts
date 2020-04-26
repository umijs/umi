import * as path from 'path';
import { OUTPUT_SERVER_FILENAME } from './constants';
import { getDistContent } from './utils';

jest.mock('fs', () => ({
  readFileSync(filename) {
    return `{${filename}}`;
  },
}));

test('getDistContent', () => {
  const absOutputPath = '/umi/test/dist';
  const result = getDistContent(absOutputPath);
  expect(result).toEqual({
    serverFile: `{${path.join(absOutputPath, OUTPUT_SERVER_FILENAME)}}`,
    serverFilePath: path.join(absOutputPath, OUTPUT_SERVER_FILENAME),
    htmlFile: `{${path.join(absOutputPath, 'index.html')}}`,
    htmlPath: path.join(absOutputPath, 'index.html'),
  });
});
