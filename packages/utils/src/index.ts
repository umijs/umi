import * as chokidar from 'chokidar';
import * as clackPrompts from '../compiled/@clack/prompts';
import address from '../compiled/address';
import axios from '../compiled/axios';
import chalk from '../compiled/chalk';
import cheerio from '../compiled/cheerio';
import crossSpawn from '../compiled/cross-spawn';
import debug from '../compiled/debug';
import deepmerge from '../compiled/deepmerge';
import * as execa from '../compiled/execa';
import fsExtra from '../compiled/fs-extra';
import glob from '../compiled/glob';
// import globby from '../compiled/globby';
import * as fastestLevenshtein from '../compiled/fastest-levenshtein';
import * as filesize from '../compiled/filesize';
import * as gzipSize from '../compiled/gzip-size';
import lodash from '../compiled/lodash';
import MagicString from '../compiled/magic-string';
import Mustache from '../compiled/mustache';
import * as pkgUp from '../compiled/pkg-up';
import portfinder from '../compiled/portfinder';
import prompts from '../compiled/prompts';
import resolve from '../compiled/resolve';
import rimraf from '../compiled/rimraf';
import semver from '../compiled/semver';
import stripAnsi from '../compiled/strip-ansi';
import yParser from '../compiled/yargs-parser';
import BaseGenerator from './BaseGenerator/BaseGenerator';
import generateFile from './BaseGenerator/generateFile';
import Generator from './Generator/Generator';
import getGitInfo from './getGitInfo';
import installDeps from './installDeps';
import * as logger from './logger';
import * as printHelp from './printHelp';
import updatePackageJSON from './updatePackageJSON';
export * as aliasUtils from './aliasUtils';
export * from './getAllFiles';
export * from './getCorejsVersion';
export * from './getDevBanner';
export * from './importLazy';
export * from './isLocalDev';
export * from './isMonorepo';
export * from './isStyleFile';
export * from './npmClient';
export * from './randomColor/randomColor';
export * as register from './register';
export * from './setNoDeprecation';
export * from './tryPaths';
export * from './winPath';
export {
  address,
  axios,
  chalk,
  cheerio,
  chokidar,
  crossSpawn,
  debug,
  deepmerge,
  execa,
  fsExtra,
  glob,
  Generator,
  BaseGenerator,
  generateFile,
  installDeps,
  // globby,
  lodash,
  logger,
  Mustache,
  pkgUp,
  portfinder,
  prompts,
  resolve,
  rimraf,
  semver,
  stripAnsi,
  updatePackageJSON,
  yParser,
  getGitInfo,
  printHelp,
  filesize,
  gzipSize,
  fastestLevenshtein,
  clackPrompts,
  MagicString,
};
