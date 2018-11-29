import { join, relative } from 'path';
import { deprecate } from 'umi-utils';

export default function(api, options = []) {
  deprecate(`umi-plugin-polyfills`, `use config.targets instead.`);
  const { paths } = api;

  api.addEntryPolyfillImports(() => {
    return ['ie9', 'ie10', 'ie11']
      .filter(key => {
        return options.includes(key);
      })
      .map(key => ({
        source: relative(paths.absTmpDirPath, join(__dirname, `${key}.js`)),
      }));
  });
}
