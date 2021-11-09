import { Plugin } from '@umijs/bundler-utils/compiled/esbuild';

export default (options?: Record<string, string>): Plugin => {
  return {
    name: 'externals',
    setup({ onLoad, onResolve }) {
      if (!options || Object.keys(options).length === 0) {
        return;
      }
      Object.keys(options).forEach((key) => {
        onResolve({ filter: new RegExp(`^${key}$`) }, (args) => ({
          path: args.path,
          namespace: key,
        }));
        onLoad({ filter: /.*/, namespace: key }, () => ({
          contents: `module.export=${options[key]}`,
          loader: 'js',
        }));
      });
    },
  };
};
