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

  const items = readdirSync(dirPath)
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
    });

  let dirs = [];
  let files = [];
  items.forEach(item => {
    if (item.type === 'directory') {
      dirs.push(item);
    } else {
      files.push(item);
    }
  });

  dirs = dirs.sort((a, b) => {
    return a - b;
  });
  files = files.sort((a, b) => {
    return a - b;
  });

  if (directoryOnly) {
    return dirs;
  } else {
    return dirs.concat(files);
  }
}
