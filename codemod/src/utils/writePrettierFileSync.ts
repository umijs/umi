import { writeFileSync } from 'fs';

export function writePrettierFileSync(filePath: string, code: string): void {
  // TODO: prettier
  // for mork test
  if (!filePath || !code) return;
  writeFileSync(filePath, code, 'utf-8');
}
