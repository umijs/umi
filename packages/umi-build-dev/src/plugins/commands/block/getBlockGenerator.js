import { existsSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import mkdirp from 'mkdirp';
import semver from 'semver';
import crequire from 'crequire';
import Mustache from 'mustache';
import upperCamelCase from 'uppercamelcase';
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

export function getAllBlockDependencies(rootDir, pkg) {
  const { blockConfig = {}, dependencies = {} } = pkg;
  const { dependencies: depBlocks = [] } = blockConfig;
  const allDependencies = {};

  function mergeDependencies(parent, sub) {
    const [lacks, conflicts] = checkConflict(sub, parent);
    if (conflicts.length) {
      throw new Error(`
      find dependencies conflict between blocks:
      ${conflicts
        .map(info => {
          return `* ${info[0]}: ${info[2]} not compatible with ${info[1]}`;
        })
        .join('\n')}`);
    }
    lacks.forEach(lack => {
      const [name, version] = lack;
      parent[name] = version;
    });
    return parent;
  }

  depBlocks.forEach(block => {
    const rubBlockDeps = getAllBlockDependencies(
      rootDir,
      // eslint-disable-next-line
      require(join(rootDir, block, 'package.json')),
    );
    mergeDependencies(allDependencies, rubBlockDeps);
  });
  mergeDependencies(allDependencies, dependencies);
  return allDependencies;
}

export function dependenciesConflictCheck(
  blockPkgDeps = {},
  projectPkgDeps = {},
  blockPkgDevDeps = {},
  projectPkgAllDeps = {},
) {
  const [lacks, conflicts] = checkConflict(blockPkgDeps, projectPkgDeps);
  const [devLacks, devConflicts] = checkConflict(blockPkgDevDeps, projectPkgAllDeps);
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

const singularReg = new RegExp(`[\'\"](@\/|[\\.\/]+)(${SINGULAR_SENSLTIVE.join('|')})\/`, 'g');

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
  const { paths, Generator, config, applyPlugins, findJS } = api;
  const blockConfig = config.block || {};

  return class BlockGenerator extends Generator {
    constructor(args, opts) {
      super(args, opts);

      this.sourcePath = opts.sourcePath;
      this.dryRun = opts.dryRun;
      this.path = opts.path;
      this.blockName = opts.blockName;
      this.isPageBlock = opts.isPageBlock;
      this.needCreateNewRoute = this.isPageBlock;
      this.blockFolderName = upperCamelCase(this.blockName);
      // 这个参数是区块的 index.tsx | js
      this.entryPath = null;
      // 这个参数是当前区块的目录
      this.blockFolderPath = join(paths.absPagesPath, this.path);
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
          message: `path ${this.path} already exist, press input a new path for it`,
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
      this.blockFolderPath = targetPath;
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
      while (!this.isPageBlock && existsSync(join(targetPath, this.blockFolderName))) {
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
        debug(`blockFolderName exist get new blockFolderName ${this.blockFolderName}`);
      }

      // create container
      this.entryPath = findJS(targetPath, 'index');
      if (!this.entryPath) {
        this.entryPath = join(targetPath, `index.${this.isTypeScript ? 'tsx' : 'js'}`);
      }

      if (!this.isPageBlock && !existsSync(this.entryPath)) {
        const confirmResult = (await this.prompt({
          type: 'confirm',
          name: 'needCreate',
          message: `Not find a exist page file at ${
            this.path
          }. Do you want to create it and import this block.`,
        })).needCreate;

        if (!confirmResult) {
          throw new Error('You stop it!');
        }

        debug('start to generate the entry file for block(s) under the path...');

        this.needCreateNewRoute = true;
        const blockEntryTpl = readFileSync(
          blockConfig.entryTemplatePath || paths.defaultBlockEntryTplPath,
          'utf-8',
        );
        const tplContent = {
          blockEntryName: `${this.path.slice(1)}Container`,
        };
        const entry = Mustache.render(blockEntryTpl, tplContent);
        mkdirp.sync(targetPath);
        writeFileSync(this.entryPath, entry);
      }

      // copy block to target
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
    }
  };
};
