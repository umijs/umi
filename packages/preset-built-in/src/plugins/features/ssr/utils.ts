import * as fs from 'fs';
import * as path from 'path';

import { OUTPUT_SERVER_FILENAME } from './constants';

export const getDistContent = (
  absOutputPath: string,
): {
  serverFile: string;
  htmlFile: string;
  htmlPath: string;
  serverFilePath: string;
} => {
  const serverFilePath = path.join(absOutputPath, OUTPUT_SERVER_FILENAME);
  const htmlPath = path.join(absOutputPath, 'index.html');

  const serverFile = fs.readFileSync(serverFilePath, 'utf-8');
  const htmlFile = fs.readFileSync(htmlPath, 'utf-8');
  return {
    serverFilePath,
    serverFile,
    htmlPath,
    htmlFile,
  };
};
