import { fsExtra } from '@umijs/utils';
import { join } from 'path';

export function getContent(tmpDir: string, filePath: string) {
  return fsExtra.readFileSync(join(tmpDir, filePath), 'utf-8');
}
