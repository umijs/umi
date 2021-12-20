// ref: https://github.com/hyrious/esbuild-plugin-style/blob/main/index.ts
import esbuild, {
  BuildOptions,
  Charset,
  Plugin,
} from '@umijs/bundler-utils/compiled/esbuild';
import { resolve } from '@umijs/utils';
import fs from 'fs';
import path from 'path';

export interface StylePluginOptions {
  /**
   * whether to minify the css code.
   * @default true
   */
  minify?: boolean;

  /**
   * css charset.
   * @default 'utf8'
   */
  charset?: Charset;
}

// https://github.com/evanw/esbuild/issues/20#issuecomment-802269745
export function inlineStyle({
  minify = true,
  charset = 'utf8',
}: StylePluginOptions = {}): Plugin {
  return {
    name: 'style',
    setup({ onResolve, onLoad }) {
      const cwd = process.cwd();
      const opt: BuildOptions = {
        logLevel: 'silent',
        bundle: true,
        write: false,
        charset,
        minify,
        loader: {
          '.svg': 'dataurl',
        },
      };

      onResolve({ filter: /\.css$/, namespace: 'file' }, (args) => {
        const absPath = path.join(args.resolveDir, args.path);
        const relPath = path.relative(cwd, absPath);
        // 通过 resolve 往上找，依赖不一定在 node_modules，可能被提到根目录，并且没有 link
        const resolved = fs.existsSync(absPath)
          ? relPath
          : resolve.sync(`${args.path}`, {
              basedir: args.resolveDir,
            });
        return { path: resolved, namespace: 'style-stub' };
      });

      onResolve({ filter: /\.css$/, namespace: 'style-stub' }, (args) => {
        return { path: args.path, namespace: 'style-content' };
      });

      onResolve(
        { filter: /^__style_helper__$/, namespace: 'style-stub' },
        (args) => ({
          path: args.path,
          namespace: 'style-helper',
          sideEffects: false,
        }),
      );

      onLoad({ filter: /.*/, namespace: 'style-helper' }, async () => ({
        contents: `
          export function injectStyle(text) {
            if (typeof document !== 'undefined') {
              var style = document.createElement('style')
              var node = document.createTextNode(text)
              style.appendChild(node)
              document.head.appendChild(style)
            }
          }
        `,
      }));

      onLoad({ filter: /.*/, namespace: 'style-stub' }, async (args) => ({
        contents: `
          import { injectStyle } from "__style_helper__"
          import css from ${JSON.stringify(args.path)}
          injectStyle(css)
        `,
      }));

      onLoad({ filter: /.*/, namespace: 'style-content' }, async (args) => {
        const options = { entryPoints: [args.path], ...opt };
        const { errors, warnings, outputFiles } = await esbuild.build(options);
        return {
          errors,
          warnings,
          contents: outputFiles![0].text,
          loader: 'text',
        };
      });
    },
  };
}
