import { winPath } from '@umijs/utils';
import type { Plugin } from '../../compiled/vite';

// @ts-ignore
type fileType = Parameters<NonNullable<Plugin['generateBundle']>>[1]['file'];

/**
 * delete specific files from output map
 * @param files file list which will be removed
 */
export default function deleteOutputFiles(
  files: string[],
  beforeDelete: (file: fileType) => void,
): Plugin {
  return {
    name: 'bundler-vite:delete-output-files',
    generateBundle(_, output) {
      Object.keys(output).forEach((name) => {
        // vite use '/' in windows
        files = files.map((file) => winPath(file));
        if (files.includes(output[name].fileName)) {
          beforeDelete(output[name]);
          delete output[name];
        }
      });
    },
  };
}
