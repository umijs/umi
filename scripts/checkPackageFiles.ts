import * as logger from '@umijs/utils/src/logger';
import { readdirSync } from 'fs';
import { isMatch } from 'matcher';
import path from 'path';
import { eachPkg, getPkgs } from './utils';

const COMMON_IGNORES = [
  'src',
  '*.md',
  'tsconfig*.json',
  'fixtures',
  'node_modules',
  'package.json',
];

const cwd = process.cwd();
let missingDetected = false;
eachPkg(getPkgs(), (opts) => {
  const pkg = require(path.join(cwd, 'packages', opts.pkg, 'package.json'));
  const base = path.join(cwd, 'packages', opts.pkg);

  const files = readdirSync(base).filter((f) => !isMatch(f, COMMON_IGNORES));
  const missingAddFiles = files.filter((f) => !isMatch(f, pkg.files));

  if (missingAddFiles.length > 0) {
    logger.error('Checking package:', opts.pkg);
    logger.error(
      `  "${missingAddFiles.join(
        ', ',
      )}"  missing in the package.json files field`,
    );
    missingDetected = true;
  }
});

if (missingDetected) {
  process.exit(1);
}
