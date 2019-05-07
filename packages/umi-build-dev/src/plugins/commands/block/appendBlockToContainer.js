import { readFileSync, writeFileSync } from 'fs';
import upperCamelCase from 'uppercamelcase';
// TODO use babel/traverse
import insertImportModule from './insertImportModule';
import insertAtPlaceholder from './insertAtPlaceholder';

const debug = require('debug')('umi-build-dev:appendBlockToContainer');

export default ({ entryPath, blockFolderName }) => {
  debug('start to update the entry file for block(s) under the path...');

  const upperCamelCaseBlockName = upperCamelCase(blockFolderName);
  const oldEntry = readFileSync(entryPath, 'utf-8');
  let newEntry = insertImportModule(oldEntry, {
    identifier: upperCamelCaseBlockName,
    modulePath: `./${blockFolderName}`,
  });

  newEntry = insertAtPlaceholder(newEntry, {
    placeholder: /\{\/\* Keep this comment and new blocks will be added above it \*\/\}/g,
    content: `<${upperCamelCaseBlockName} />\n{/* Keep this comment and new blocks will be added above it */}`,
  });

  debug(`newEntry: ${newEntry}`);

  writeFileSync(entryPath, newEntry);
};
