import { glob, lodash, logger } from '@umijs/utils';
import { isMatch } from 'matcher';
import 'zx/globals';
import { eachPkg, getPkgs } from './utils';

const COMMON_IGNORES = [
  // default included
  'bin',
  // deps
  'node_modules',
  // for test
  'fixtures',
  'examples',
  'scripts',
  // source
  'src',
  'bundles',
  // doc
  '*.md',
  // config files
  'tsconfig*.json',
  '*.config.js',
  'package.json',
  // extra
  'devToolApp',
];

// check packages/*
let missingDetected = false;
eachPkg(getPkgs(), ({ pkgJson, dir, name, pkgPath }) => {
  /**
   * check `files` missing
   */
  const files = fs.readdirSync(dir).filter((f) => {
    return !isMatch(f, COMMON_IGNORES) && !f.startsWith('.');
  });
  const missingAddFiles = files.filter((f) => !isMatch(f, pkgJson.files));

  if (missingAddFiles.length > 0) {
    logger.error('Checking package:', name);
    logger.error(
      `  "${missingAddFiles.join(
        ', ',
      )}"  missing in the package.json files field`,
    );
    missingDetected = true;
  }

  /**
   * check jest `test` script exist
   */
  const testFiles = glob.sync(`${path.join(dir)}/src/**/*.test.ts`);
  const oldPkgJson = lodash.cloneDeep(pkgJson);
  if (testFiles.length) {
    pkgJson.scripts.test = 'jest -c ../../jest.turbo.config.ts';
  } else {
    delete pkgJson.scripts.test;
  }
  if (!lodash.isEqual(oldPkgJson, pkgJson)) {
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 2)}\n`, 'utf-8');
  }
});
if (missingDetected) {
  process.exit(1);
} else {
  logger.ready(`Check packages files success`);
}

// check examples/*
const EXAMPLE_DIR = path.join(__dirname, '../examples');
eachPkg(
  getPkgs({ base: EXAMPLE_DIR }),
  ({ name, pkgJson, pkgPath }) => {
    /**
     * check example `package.json` includes required fields
     */
    logger.info(`Checking ${chalk.blue('example')}:`, name);
    const oldPkgJson = lodash.cloneDeep(pkgJson);
    const expectName = `@example/${name}`;
    if (pkgJson.name !== expectName) {
      pkgJson.name = expectName;
      logger.warn(
        chalk.yellow(`Change '${name}' example name to '${expectName}'`),
      );
    }
    if (pkgJson.private !== true) {
      pkgJson.private = true;
      logger.warn(chalk.yellow(`Set '${name}' example as private pacakge`));
    }
    if (!lodash.isEqual(pkgJson, oldPkgJson)) {
      fs.writeFileSync(
        pkgPath,
        `${JSON.stringify(pkgJson, null, 2)}\n`,
        'utf-8',
      );
    }
  },
  {
    base: EXAMPLE_DIR,
  },
);
logger.ready(`Check examples success`);
