import type { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';
import path from 'path';

export function esbuildExternalPlugin(): Plugin {
  return {
    name: 'esbuildExternalPlugin',
    setup(build) {
      // externals extensions
      externalsExtensions.forEach((ext) => {
        // /\.abc?query$/
        const filter = new RegExp(`\.${ext}(\\?.*)?$`);
        build.onResolve({ filter }, () => {
          return {
            external: true,
          };
        });
      });
      // external deps
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.path.startsWith('.')) {
          return null;
        }

        if (args.kind === 'entry-point') {
          return null;
        }

        const winP = winPath(args.path);
        const isAliasImport = winP.startsWith('@/') || winP.startsWith('@@/');
        if (isAliasImport) {
          return null;
        }

        // 不在 node_modules 里的，并且以 / 开头的，不走 external
        // e.g.
        // /abc > none external
        // /xxx/node_modules/xxx > external
        const isNodeModuleImport = args.path.includes('node_modules');
        if (path.isAbsolute(args.path) && !isNodeModuleImport) {
          return null;
        }

        return {
          external: true,
        };
      });
    },
  };
}

const externalsExtensions = [
  'aac',
  'css',
  'less',
  'sass',
  'scss',
  'eot',
  'flac',
  'gif',
  'html',
  'htm',
  'ico',
  'icon',
  'jpeg',
  'jpg',
  'json',
  'md',
  'mdx',
  'mp3',
  'mp4',
  'ogg',
  'otf',
  'png',
  'svg',
  'ttf',
  'wav',
  'webm',
  'webp',
  'woff',
  'woff2',
];
