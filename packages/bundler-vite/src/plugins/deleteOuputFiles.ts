import type { Plugin } from 'vite';

/**
 * delete specific files from output map
 * @param files file list which will be removed
 */
export default function deleteOuputFiles(files: string[]): Plugin {
  return {
    name: 'bundler-vite:delete-output-files',
    writeBundle(_, output) {
      Object.keys(output).forEach(name => {
        if (files.includes(output[name].fileName)) {
          delete output[name];
        }
      });
    },
  };
}
