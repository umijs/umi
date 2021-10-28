import * as chokidar from 'chokidar';
import * as clipboardy from 'clipboardy';
import address from '../compiled/address';
import axios from '../compiled/axios';
import chalk from '../compiled/chalk';
import cheerio from '../compiled/cheerio';
import crossSpawn from '../compiled/cross-spawn';
import debug from '../compiled/debug';
import fsExtra from '../compiled/fs-extra';
import glob from '../compiled/glob';
// import globby from '../compiled/globby';
import lodash from '../compiled/lodash';
import Mustache from '../compiled/mustache';
import pkgUp from '../compiled/pkg-up';
import portfinder from '../compiled/portfinder';
import prettier from '../compiled/prettier';
import prompts from '../compiled/prompts';
import resolve from '../compiled/resolve';
import rimraf from '../compiled/rimraf';
import semver from '../compiled/semver';
import stripAnsi from '../compiled/strip-ansi';
import yParser from '../compiled/yargs-parser';
import BaseGenerator from './BaseGenerator/BaseGenerator';
import Generator from './Generator/Generator';
import * as logger from './logger';
export * from './importLazy';
export * from './randomColor/randomColor';
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
  glob,
  Generator,
  BaseGenerator,
  // globby,
  lodash,
  logger,
  Mustache,
  pkgUp,
  portfinder,
  prettier,
  prompts,
  resolve,
  rimraf,
  semver,
  stripAnsi,
  yParser,
};
