import { join, relative } from 'path';

export default function(api, options = []) {
  const { paths } = api;

  if (options.includes('ie9')) {
    api.addEntryImportAhead(() => {
      return {
        source: relative(paths.absTmpDirPath, join(__dirname, 'global.js')),
      };
    });
  }
}
