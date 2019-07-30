import { readdirSync, statSync } from 'fs';
import assert from 'assert';
import { join } from 'path';

interface IOpts {
  showHidden?: boolean;
  directoryOnly?: boolean;
}

export default function(dirPath, opts: IOpts = {}) {
  const { showHidden, directoryOnly } = opts;
  assert(statSync(dirPath).isDirectory(), `path ${dirPath} is not a directory`);

  return readdirSync(dirPath)
    .filter(fileName => {
      if (showHidden) {
        return true;
      } else {
        return !fileName.startsWith('.');
      }
    })
    .map(fileName => {
      const type = statSync(join(dirPath, fileName)).isDirectory() ? 'directory' : 'file';
      return {
        type,
        fileName,
      };
    })
    .sort(a => {
      return a.type === 'directory' ? -1 : 1;
    })
    .filter(f => {
      if (directoryOnly) {
        return f.type === 'directory';
      } else {
        return true;
      }
    });
}
