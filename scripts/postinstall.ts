import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const path = join(
  __dirname,
  '../node_modules/@vercel/ncc/dist/ncc/index.js.cache.js',
);
const content = readFileSync(path, 'utf-8');

// TO_REPLACE
const TO_REPLACE = `if(j.uid<0)j.uid+=4294967296;if(j.gid<0)j.gid+=4294967296;`;
const REPLACED = `/*${TO_REPLACE}*/`;

// ref: https://github.com/isaacs/node-graceful-fs/commit/e61a20a052b838f420b98195c232a824a6ac04ee
console.log('patch ncc');
if (content.includes(REPLACED)) {
  console.log('already patched');
} else {
  console.log('patching');
  const newContent = content.replace(TO_REPLACE, REPLACED);
  writeFileSync(path, newContent, 'utf-8');
}
