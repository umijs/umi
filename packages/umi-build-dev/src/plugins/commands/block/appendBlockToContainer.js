import { readFileSync, writeFileSync } from 'fs';
import insertComponent from './sdk/insertComponent';

const debug = require('debug')('umi-build-dev:appendBlockToContainer');

export default ({ entryPath, blockFolderName, dryRun, index }) => {
  debug('start to update the entry file for block(s) under the path...');

  const oldEntry = readFileSync(entryPath, 'utf-8');
  debug(`insert component ${blockFolderName} with index ${index}`);
  const newEntry = insertComponent(oldEntry, {
    identifier: blockFolderName,
    relativePath: `./${blockFolderName}`,
    index,
  });

  if (!dryRun) {
    writeFileSync(entryPath, newEntry);
  }
};
