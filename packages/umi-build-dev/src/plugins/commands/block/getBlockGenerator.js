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
import upperCamelCase from 'uppercamelcase';
import replaceContent from './replaceContent';
import { SINGULAR_SENSLTIVE } from '../../../constants';
import insertImportModule from './insertImportModule';
import insertAtPlaceholder from './insertAtPlaceholder';

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
      this.pkgName = opts.pkgName;

      this.on('error', e => {
        debug(e); // handle the error for aviod throw generator default error stack
      });
    }

    async writing() {
      let targetPath = join(paths.absPagesPath, this.path);
      debug(`get targetPath ${targetPath}`);
      // check for duplicate path
      // if there is, prompt for confirmation, otherwise input a new path
      if (existsSync(targetPath)) {
        this.path = (await this.prompt({
          type: 'input',
          name: 'path',
          message: `path ${
            this.path
          } already exist, press Enter to continue or input a new path for it`,
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
      let blockFolderName = this.pkgName;
      while (existsSync(join(targetPath, blockFolderName))) {
        blockFolderName = (await this.prompt({
          type: 'input',
          name: 'path',
          message: `block with name ${blockFolderName} already exist, please input a new name for it`,
          required: true,
          default: blockFolderName,
        })).path;
        // if (!/^\//.test(blockFolderName)) {
        //   blockFolderName = `/${blockFolderName}`;
        // }
        debug(
          `blockFolderName exist get new blockFolderName ${blockFolderName}`,
        );
      }

      // you can find the copy api detail in https://github.com/SBoudrias/mem-fs-editor/blob/master/lib/actions/copy.js
      debug('start copy block file to your project...');
      ['src', '@'].forEach(folder => {
        const folderPath = join(this.sourcePath, folder);
        const targetFolder =
          folder === 'src'
            ? join(targetPath, blockFolderName)
            : paths.absSrcPath;

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

      const entryPath = join(targetPath, 'index.js');
      const upperCamelCaseBlockName = upperCamelCase(blockFolderName);

      if (existsSync(entryPath)) {
        debug('start to update the entry file for block(s) under the path...');

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
      } else {
        debug(
          'start to generate the entry file for block(s) under the path...',
        );

        const blocks = [];
        if (existsSync(targetPath)) {
          readdirSync(targetPath).forEach(name => {
            // ignore hidden folders
            if (name.charAt(0) === '.') {
              return;
            }

            blocks.push({ blockName: upperCamelCase(name), blockPath: name });
          });
        }

        blocks.push({
          blockName: upperCamelCaseBlockName,
          blockPath: blockFolderName,
        });

        const blockEntryTpl = readFileSync(
          paths.defaultBlockEntryPath,
          'utf-8',
        );
        const tplContent = {
          reactPath: process.env.BIGFISH_COMPAT
            ? '@alipay/bigfish/react'
            : 'react',
          blockEntryName: `${this.path.slice(1)}Container`,
          blocks,
        };
        const entry = Mustache.render(blockEntryTpl, tplContent);
        mkdirp.sync(targetPath);
        writeFileSync(entryPath, entry);
      }
    }
  };
};
