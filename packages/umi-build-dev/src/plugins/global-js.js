import { join } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { IMPORT } = api.placeholder;
  const { paths } = api.service;

  const globalFiles = [
    join(paths.absSrcPath, 'global.tsx'),
    join(paths.absSrcPath, 'global.ts'),
    join(paths.absSrcPath, 'global.jsx'),
    join(paths.absSrcPath, 'global.js'),
  ];

  function getGlobalJS() {
    for (const file of globalFiles) {
      if (existsSync(file)) {
        return file;
      }
    }
  }

  api.register('modifyEntryFile', ({ memo }) => {
    const globalJS = getGlobalJS();
    if (globalJS) {
      memo = `import '${globalJS}';\r\n${memo}`;
    }
    return memo;
  });

  api.register('modifyPageWatchers', ({ memo }) => {
    return [...memo, ...globalFiles];
  });
}
