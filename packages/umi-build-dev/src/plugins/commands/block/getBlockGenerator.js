import {
  existsSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import mkdirp from 'mkdirp';
import semver from 'semver';
import crequire from 'crequire';
import Mustache from 'mustache';
import replaceContent from './replaceContent';
import { SINGULAR_SENSLTIVE } from '../../../constants';

const debug = require('debug')('umi-build-dev:getBlockGenerator');

export function getNameFromPkg(pkg) {
  if (!pkg.name) {
    return null;
  }
  return pkg.name.split('/').pop();
}

function checkConflict(blockDeps, projectDeps) {
  const lacks = [];
  const conflicts = [];
  Object.keys(blockDeps).forEach(dep => {
    if (!projectDeps[dep]) {
      lacks.push([dep, blockDeps[dep]]);
    } else if (!semver.intersects(projectDeps[dep], blockDeps[dep])) {
      conflicts.push([dep, blockDeps[dep], projectDeps[dep]]);
    }
  });
  return [lacks, conflicts];
}

export function dependenciesConflictCheck(
  blockPkgDeps = {},
  projectPkgDeps = {},
  blockPkgDevDeps = {},
  projectPkgAllDeps = {},
) {
  const [lacks, conflicts] = checkConflict(blockPkgDeps, projectPkgDeps);
  const [devLacks, devConflicts] = checkConflict(
    blockPkgDevDeps,
    projectPkgAllDeps,
  );
  return {
    conflicts,
    lacks,
    devConflicts,
    devLacks,
  };
}

export function getMockDependencies(mockContent, blockPkg) {
  const allDependencies = {
    ...blockPkg.devDependencies,
    ...blockPkg.dependencies,
  };
  const deps = {};
  try {
    crequire(mockContent).forEach(item => {
      if (allDependencies[item.path]) {
        deps[item.path] = allDependencies[item.path];
      }
    });
  } catch (e) {
    debug('parse mock content failed');
    debug(e);
  }

  return deps;
}

const singularReg = new RegExp(
  `[\'\"](@\/|[\\.\/]+)(${SINGULAR_SENSLTIVE.join('|')})\/`,
  'g',
);

export function parseContentToSingular(content) {
  return content.replace(singularReg, (all, prefix, match) => {
    return all.replace(match, match.replace(/s$/, ''));
  });
}

export function getSingularName(name) {
  if (SINGULAR_SENSLTIVE.includes(name)) {
    name = name.replace(/s$/, '');
  }
  return name;
}

export default api => {
  const { paths, Generator, config, applyPlugins } = api;

  return class BlockGenerator extends Generator {
    constructor(args, opts) {
      super(args, opts);

      this.sourcePath = opts.sourcePath;
      this.dryRun = opts.dryRun;
      this.path = opts.path;
      this.blockName = opts.blockName;
      this.isPageBlock = opts.isPageBlock;
      this.needCreateNewRoute = this.isPageBlock;
      this.blockFolderName = this.blockName;
      this.entryPath = null;

      this.on('error', e => {
        debug(e); // handle the error for aviod throw generator default error stack
      });
    }

    async writing() {
      let targetPath = join(paths.absPagesPath, this.path);
      debug(`get targetPath ${targetPath}`);
      // for old page block check for duplicate path
      // if there is, prompt for input a new path
      while (this.isPageBlock && existsSync(targetPath)) {
        // eslint-disable-next-line no-await-in-loop
        this.path = (await this.prompt({
          type: 'input',
          name: 'path',
          message: `path ${
            this.path
          } already exist, press input a new path for it`,
          required: true,
          default: this.path,
        })).path;
        // fix demo => /demo
        if (!/^\//.test(this.path)) {
          this.path = `/${this.path}`;
        }
        targetPath = join(paths.absPagesPath, this.path);
        debug(`targetPath exist get new targetPath ${targetPath}`);
      }

      const blockPath = this.path;

      applyPlugins('beforeBlockWriting', {
        args: {
          sourcePath: this.sourcePath,
          blockPath,
        },
      });

      if (this.dryRun) {
        debug('dryRun is true, skip copy files');
        return;
      }

      // check for duplicate block name under the path
      // if there is, prompt for a new block name
      while (
        !this.isPageBlock &&
        existsSync(join(targetPath, this.blockFolderName))
      ) {
        // eslint-disable-next-line no-await-in-loop
        this.blockFolderName = (await this.prompt({
          type: 'input',
          name: 'path',
          message: `block with name ${
            this.blockFolderName
          } already exist, please input a new name for it`,
          required: true,
          default: this.blockFolderName,
        })).path;
        // if (!/^\//.test(blockFolderName)) {
        //   blockFolderName = `/${blockFolderName}`;
        // }
        debug(
          `blockFolderName exist get new blockFolderName ${
            this.blockFolderName
          }`,
        );
      }

      // you can find the copy api detail in https://github.com/SBoudrias/mem-fs-editor/blob/master/lib/actions/copy.js
      debug('start copy block file to your project...');
      ['src', '@'].forEach(folder => {
        if (!this.isPageBlock && folder === '@') {
          // @ folder not support anymore in new specVersion
          return;
        }
        const folderPath = join(this.sourcePath, folder);
        let targetFolder;
        if (this.isPageBlock) {
          targetFolder = folder === 'src' ? targetPath : paths.absSrcPath;
        } else {
          targetFolder = join(targetPath, this.blockFolderName);
        }
        const options = {
          process(content, targetPath) {
            content = String(content);
            if (config.singular) {
              content = parseContentToSingular(content);
            }
            content = replaceContent(content, {
              path: blockPath,
            });
            return applyPlugins('_modifyBlockFile', {
              initialValue: content,
              args: {
                blockPath,
                targetPath,
              },
            });
          },
        };
        if (existsSync(folderPath)) {
          readdirSync(folderPath).forEach(name => {
            // ignore the dot files
            if (name.charAt(0) === '.') {
              return;
            }
            const thePath = join(folderPath, name);
            if (statSync(thePath).isDirectory() && config.singular) {
              // @/components/ => @/src/component/ and ./components/ => ./component etc.
              name = getSingularName(name);
            }
            const realTarget = applyPlugins('_modifyBlockTarget', {
              initialValue: join(targetFolder, name),
              args: {
                source: thePath,
                blockPath,
                sourceName: name,
              },
            });
            debug(`copy ${thePath} to ${realTarget}`);
            this.fs.copy(thePath, realTarget, options);
          });
        }
      });

      this.entryPath = join(targetPath, 'index.js');

      if (!this.isPageBlock && !existsSync(this.entryPath)) {
        debug(
          'start to generate the entry file for block(s) under the path...',
        );

        this.needCreateNewRoute = true;
        const blockEntryTpl = readFileSync(
          paths.defaultBlockEntryPath,
          'utf-8',
        );
        const tplContent = {
          blockEntryName: `${this.path.slice(1)}Container`,
        };
        const entry = Mustache.render(blockEntryTpl, tplContent);
        mkdirp.sync(targetPath);
        writeFileSync(this.entryPath, entry);
      }
    }
  };
};
