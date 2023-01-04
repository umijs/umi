import type { Plugin } from '@umijs/bundler-utils/compiled/esbuild';

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
        if (args.path.startsWith('.') || args.path.startsWith('/')) {
          return null;
        } else {
          return {
            external: true,
          };
        }
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
  'ico',
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
