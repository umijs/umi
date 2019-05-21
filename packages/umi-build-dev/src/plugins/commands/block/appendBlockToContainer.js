import { readFileSync, writeFileSync } from 'fs';
import insertComponent from './insertComponent';

const debug = require('debug')('umi-build-dev:appendBlockToContainer');

export default ({ entryPath, blockFolderName, dryRun }) => {
  debug('start to update the entry file for block(s) under the path...');

  const oldEntry = readFileSync(entryPath, 'utf-8');
  const newEntry = insertComponent(oldEntry, {
    identifier: blockFolderName,
    relativePath: `./${blockFolderName}`,
  });

  if (!dryRun) {
    writeFileSync(entryPath, newEntry);
  }
};
