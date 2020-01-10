import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import insertComponent from './sdk/insertComponent';
import { INSERT_BLOCK_PLACEHOLDER, UMI_UI_FLAG_PLACEHOLDER } from './sdk/constants';

const debug = require('debug')('umi-build-dev:appendBlockToContainer');

function findIndexFile(dir) {
  if (existsSync(join(dir, 'index.js'))) return join(dir, 'index.js');
  if (existsSync(join(dir, 'index.jsx'))) return join(dir, 'index.jsx');
  if (existsSync(join(dir, 'index.tsx'))) return join(dir, 'index.tsx');
  if (existsSync(join(dir, 'index.ts'))) return join(dir, 'index.ts');
}

export default ({ entryPath, blockFolderName, dryRun, index }) => {
  debug('start to update the entry file for block(s) under the path...');

  const oldEntry = readFileSync(entryPath, 'utf-8');
  debug(`insert component ${blockFolderName} with index ${index}`);
  const absolutePath = findIndexFile(join(dirname(entryPath), blockFolderName));
  const blockContent = readFileSync(absolutePath, 'utf-8');
  const newEntry = insertComponent(oldEntry, {
    identifier: blockFolderName,
    relativePath: `./${blockFolderName}`,
    absolutePath,
    isExtractBlock:
      blockContent.includes(INSERT_BLOCK_PLACEHOLDER) ||
      blockContent.includes(UMI_UI_FLAG_PLACEHOLDER),
    index,
  });

  if (!dryRun) {
    writeFileSync(entryPath, newEntry);
  }
};
