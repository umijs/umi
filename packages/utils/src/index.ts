import * as chokidar from 'chokidar';
import * as clipboardy from 'clipboardy';
import address from '../compiled/address';
import axios from '../compiled/axios';
import chalk from '../compiled/chalk';
import cheerio from '../compiled/cheerio';
import crossSpawn from '../compiled/cross-spawn';
import debug from '../compiled/debug';
import fsExtra from '../compiled/fs-extra';
// import globby from '../compiled/globby';
import lodash from '../compiled/lodash';
import pkgUp from '../compiled/pkg-up';
import portfinder from '../compiled/portfinder';
import resolve from '../compiled/resolve';
import rimraf from '../compiled/rimraf';
import semver from '../compiled/semver';
import stripAnsi from '../compiled/strip-ansi';
import yParser from '../compiled/yargs-parser';
import * as logger from './logger';
export * from './importLazy';
export * as register from './register';
export * from './winPath';
export {
  address,
  axios,
  chalk,
  cheerio,
  chokidar,
  clipboardy,
  crossSpawn,
  debug,
  fsExtra,
  // globby,
  lodash,
  logger,
  pkgUp,
  portfinder,
  resolve,
  rimraf,
  semver,
  stripAnsi,
  yParser,
};
