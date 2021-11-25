import { init, parse } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { readFileSync } from 'fs';

interface Dep {
  url: string;
  importType: 'import' | 'dynamicImport' | 'export';
  // 只有 opts.needDepSpecifier 为 true 时才返回
  specifiers?: 'namespace' | string[]; // default 用特殊字符串 __default__
}

export async function scan(opts: {
  content: string;
  needDepSpecifier?: boolean;
}): Promise<{ deps: Dep[] }> {
  await init;
  parse(opts.content);
  return { deps: [] };
}

export async function scanFile(opts: {
  entry: string;
  alias: any;
  externals: any;
}) {
  opts.entry;
  const content = readFileSync(opts.entry, 'utf-8');
  const { deps } = await scan({ content });
  deps;
  // const file;
  // const isDependency;
}
