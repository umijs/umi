import { existsSync, readFileSync } from 'fs';
import { parse } from '../utils/parse';

export function getASTByFilePath(filePath: string) {
  if (existsSync(filePath)) {
    const code = readFileSync(filePath, 'utf-8');
    const ast = parse(code);
    return ast;
  }
  console.warn(`${filePath} is not found`);
  return null;
}
