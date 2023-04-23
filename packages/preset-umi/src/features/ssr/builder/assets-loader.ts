import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { ensureLastSlash } from './css-loader';

const NAMESPACE = 'staticAssets';

export function assetsLoader(opts: { cwd: string }): esbuild.Plugin {
  const assetsFilter = /\.(png|jpg|jpeg|gif|woff|woff2|ttf|eot|mp3|mp4)$/;
  return {
    name: 'assets-loader',
    setup(build) {
      opts;

      // 帮静态资源打上 staticAssets 的 namespace，然后 onLoad 的时候一起处理
      build.onResolve({ filter: assetsFilter }, (args) => {
        return {
          path: join(args.resolveDir, args.path),
          namespace: NAMESPACE,
        };
      });

      // 对于静态资源，我们根据 Webpack 最终打包出来的 manifest 文件，将他们解析到静态资源地址
      build.onLoad(
        { filter: assetsFilter, namespace: NAMESPACE },
        async (args) => {
          const filename = winPath(args.path).replace(
            ensureLastSlash(winPath(opts.cwd)),
            '',
          );
          if (
            existsSync(args.path) &&
            statSync(args.path).isFile() &&
            statSync(args.path).size < 10000
          ) {
            return {
              contents: readFileSync(args.path),
              loader: 'dataurl',
            };
          } else {
            return {
              contents: `export default g_getAssets('${filename}')`,
              loader: 'js',
            };
          }
        },
      );
    },
  };
}
