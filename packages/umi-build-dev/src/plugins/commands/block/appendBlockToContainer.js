import { readFileSync, writeFileSync } from 'fs';
import upperCamelCase from 'uppercamelcase';
import insertComponent from './insertComponent';

const debug = require('debug')('umi-build-dev:appendBlockToContainer');

export default ({ entryPath, blockFolderName }) => {
  debug('start to update the entry file for block(s) under the path...');

  const upperCamelCaseBlockName = upperCamelCase(blockFolderName);
  const oldEntry = readFileSync(entryPath, 'utf-8');
  const newEntry = insertComponent(oldEntry, {
    identifier: upperCamelCaseBlockName,
    relativePath: `./${blockFolderName}`,
  });

  debug(`newEntry: ${newEntry}`);

  writeFileSync(entryPath, newEntry);
};
