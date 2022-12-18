// ref: https://github.com/hyrious/esbuild-plugin-style/blob/main/index.ts
import esbuild, {
  BuildOptions,
  Charset,
  Plugin,
} from '@umijs/bundler-utils/compiled/esbuild';
import { resolve } from '@umijs/utils';
import fs from 'fs';
import path from 'path';
import { IConfig } from '../types';
import { postcssProcess } from '../utils/postcssProcess';

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

  inlineStyle?: boolean;

  config?: IConfig;
}

// https://github.com/evanw/esbuild/issues/20#issuecomment-802269745
export function style({
  minify = true,
  charset = 'utf8',
  inlineStyle,
  config,
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
          // images
          '.svg': 'dataurl',
          '.png': 'dataurl',
          '.jpg': 'dataurl',
          '.jpeg': 'dataurl',
          '.gif': 'dataurl',
          '.ico': 'dataurl',
          '.webp': 'dataurl',
          // font
          '.ttf': 'dataurl',
          '.otf': 'dataurl',
          '.woff': 'dataurl',
          '.woff2': 'dataurl',
          '.eot': 'dataurl',
        },
      };

      onResolve({ filter: /\.css$/, namespace: 'file' }, (args) => {
        const absPath = path.resolve(
          cwd,
          path.relative(cwd, args.resolveDir),
          args.path,
        );
        // 通过 resolve 往上找，依赖不一定在 node_modules，可能被提到根目录，并且没有 link
        const resolved = fs.existsSync(absPath)
          ? absPath
          : resolve.sync(`${args.path}`, {
              basedir: args.resolveDir,
            });
        return { path: resolved, namespace: inlineStyle ? 'style-stub' : '' };
      });
      if (inlineStyle) {
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
      }

      onLoad(
        {
          filter: inlineStyle ? /.*/ : /\.css$/,
          namespace: inlineStyle ? 'style-content' : 'file',
        },
        async (args) => {
          const options = { entryPoints: [args.path], ...opt };
          const { errors, warnings, outputFiles } = await esbuild.build(
            options,
          );
          if (errors.length > 0) {
            return {
              errors,
              warnings,
              contents: outputFiles![0].text,
              loader: 'text',
            };
          }
          const dir = path.dirname(args.path);
          try {
            const result = await postcssProcess(
              config!,
              outputFiles![0].text,
              args.path,
            );
            return {
              errors,
              warnings,
              contents: result.css,
              loader: inlineStyle ? 'text' : 'css',
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
        },
      );
    },
  };
}
