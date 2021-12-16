import { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { promises as fs } from 'fs';
import less from 'less';
import path from 'path';
import { sortByAffix } from '../utils/sortByAffix';

const aliasLessImports = (ctx: string, alias: Record<string, string>) => {
  const importRegex = /@import(?:\s+\((.*)\))?\s+['"](.*)['"]/;
  const globalImportRegex = /@import(?:\s+\((.*)\))?\s+['"](.*)['"]/g;
  const match = ctx.match(globalImportRegex) || [];
  match.forEach((el) => {
    const [imp, _, filePath] = el.match(importRegex) || [];
    let aliaPath = filePath;
    // ～ 写法在 esbuild 中无实际意义
    if (filePath.startsWith('~')) {
      aliaPath = filePath.replace('~', '');
    }
    const keys = sortByAffix({ arr: Object.keys(alias), affix: '$' });
    keys.forEach(async (key) => {
      const value = alias[key];
      const filter = new RegExp(`^${key}`);
      if (filter.test(aliaPath)) {
        aliaPath = aliaPath.replace(filter, value);
        const aliaPathUrl = path.resolve(
          path.extname(aliaPath) ? aliaPath : `${aliaPath}.less`,
        );
        ctx = ctx.replace(imp, el.replace(filePath, aliaPathUrl));
      }
    });
  });
  return ctx;
};

export default (
  options: Less.Options & { alias?: Record<string, string> } = {},
): Plugin => {
  const { alias, ...lessOptions } = options;
  return {
    name: 'less',
    setup({ onLoad }) {
      onLoad({ filter: /\.less$/, namespace: 'file' }, async (args) => {
        let content = await fs.readFile(args.path, 'utf-8');
        if (!!alias) {
          content = aliasLessImports(content, alias);
        }
        const dir = path.dirname(args.path);
        const filename = path.basename(args.path);
        try {
          const result = await less.render(content, {
            filename,
            rootpath: dir,
            ...lessOptions,
            paths: [...(lessOptions.paths || []), dir],
          });

          return {
            contents: result.css,
            loader: 'css',
            resolveDir: dir,
          };
        } catch (error: any) {
          return {
            errors: [
              {
                text: error.message,
                location: {
                  namespace: 'file',
                  file: error.filename,
                  line: error.line,
                  column: error.column,
                },
              },
            ],
            resolveDir: dir,
          };
        }
      });
    },
  };
};
