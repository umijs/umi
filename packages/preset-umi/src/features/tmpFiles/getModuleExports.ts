import { parseModule } from '@umijs/bundler-utils';
import { readFileSync } from 'fs';

export async function getModuleExports(opts: {
  file: string;
}): Promise<readonly string[]> {
  const content = readFileSync(opts.file, 'utf-8');
  const [_, exports] = await parseModule({ content, path: opts.file });
  return exports || [];
}
