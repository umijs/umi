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
import remapping from '../compiled/@ampproject/remapping';
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
import * as tsconfigPaths from '../compiled/tsconfig-paths';
import yParser from '../compiled/yargs-parser';
import { z } from '../compiled/zod';
import BaseGenerator from './BaseGenerator/BaseGenerator';
import generateFile from './BaseGenerator/generateFile';
import Generator from './Generator/Generator';
import getGitInfo from './getGitInfo';
import installDeps from './installDeps';
import * as logger from './logger';
import * as printHelp from './printHelp';
import updatePackageJSON from './updatePackageJSON';
export * as aliasUtils from './aliasUtils';
export * from './getCorejsVersion';
export * from './getDevBanner';
export * as git from './getFileGitIno';
export * from './importLazy';
export * from './isJavaScriptFile';
export * from './isLocalDev';
export * from './isMonorepo';
export * from './isStyleFile';
export * from './node';
export * from './npmClient';
export * from './randomColor/randomColor';
export * from './readDirFiles';
export * as register from './register';
export * from './setNoDeprecation';
export * from './tryPaths';
export * from './winPath';
export * from './zod/isZodSchema';
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
  remapping,
  tsconfigPaths,
  z as zod,
};
