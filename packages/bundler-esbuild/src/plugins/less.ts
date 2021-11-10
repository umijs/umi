import { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { promises as fs } from 'fs';
import less from 'less';
import path from 'path';

export default (options: Less.Options = {}): Plugin => {
  return {
    name: 'less',
    setup({ onLoad }) {
      onLoad({ filter: /\.less$/, namespace: 'file' }, async (args) => {
        const content = await fs.readFile(args.path, 'utf-8');
        const dir = path.dirname(args.path);
        const filename = path.basename(args.path);
        try {
          const result = await less.render(content, {
            filename,
            rootpath: dir,
            ...options,
            paths: [...(options.paths || []), dir],
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
