import { join, relative } from 'path';

export default function(api, options = []) {
  const { paths } = api;

  api.addEntryImportAhead(() => {
    return ['ie9', 'ie10', 'ie11']
      .filter(key => {
        return options.includes(key);
      })
      .map(key => ({
        source: relative(paths.absTmpDirPath, join(__dirname, `${key}.js`)),
      }));
  });
}
