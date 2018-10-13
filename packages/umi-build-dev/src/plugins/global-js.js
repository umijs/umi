import { join, relative } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { paths } = api.service;

  const globalFiles = [
    join(paths.absSrcPath, 'global.tsx'),
    join(paths.absSrcPath, 'global.ts'),
    join(paths.absSrcPath, 'global.jsx'),
    join(paths.absSrcPath, 'global.js'),
  ];

  api.addEntryImportAhead(() => {
    return globalFiles
      .filter(f => existsSync(f))
      .slice(0, 1)
      .map(f => ({
        source: relative(paths.absTmpDirPath, f),
      }));
  });

  api.addPageWatcher(globalFiles);
}
