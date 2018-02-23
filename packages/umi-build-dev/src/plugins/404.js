import { join } from 'path';
import { existsSync } from 'fs';

const EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

export default function(api) {
  const { paths } = api.service;
  const { winPath } = api.utils;

  function get404JS() {
    for (const extname of EXTNAMES) {
      const filePath = winPath(join(paths.absPagesPath, `404${extname}`));
      if (existsSync(filePath)) {
        return filePath;
      }
    }
  }

  api.register('modifyRoutesContent', ({ memo }) => {
    const filePath = get404JS();
    if (filePath) {
      memo.push(`    <Route component={require('${filePath}').default} />`);
    }
    return memo;
  });
}
