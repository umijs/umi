import { writeFileSync } from 'fs';
import path from 'path';
import prettier from 'prettier';

export function writePrettierFileSync(filePath: string, code: string): void {
  // for mork test
  if (!filePath || !code) return;
  const options = { parser: 'babel' };
  if (path.extname(filePath) === '.json') {
    options.parser = 'json';
  }
  const newCode = prettier.format(code, options);
  writeFileSync(filePath, newCode, 'utf-8');
}
