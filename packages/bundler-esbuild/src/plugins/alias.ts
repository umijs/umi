import { Plugin } from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';

// https://esbuild.github.io/plugins/#resolve-callbacks
export default (options?: Record<string, string>): Plugin => {
  return {
    name: 'alias',
    setup({ onResolve }) {
      if (!options || Object.keys(options).length === 0) {
        return;
      }
      Object.keys(options).forEach((key) => {
        // import react from 'react';
        onResolve({ filter: new RegExp(`^${key}$`) }, (args) => {
          return {
            path: winPath(args.path).replace(
              new RegExp(`^${key}$`),
              options[key],
            ),
          };
        });
        // import abc from 'react/abc';
        // import abc from 'react/abc.js';
        onResolve({ filter: new RegExp(`^${key}\\/.*$`) }, (args) => {
          return {
            path: winPath(args.path).replace(
              new RegExp(`^${key}`),
              options[key],
            ),
          };
        });
      });
    },
  };
};
