import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import semver from 'semver';
import replaceContent from './replaceContent';
import { SINGULAR_SENSLTIVE } from '../../../constants';

const debug = require('debug')('umi-build-dev:getBlockGenerator');

export function getNameFromPkg(pkg) {
  if (!pkg.name) {
    return null;
  }
  return pkg.name.split('/').pop();
}

export function dependenciesConflictCheck(
  blockPkgDeps = {},
  projectPkgDeps = {},
) {
  const lacks = [];
  const conflicts = [];
  Object.keys(blockPkgDeps).forEach(dep => {
    if (!projectPkgDeps[dep]) {
      lacks.push([dep, blockPkgDeps[dep]]);
    } else if (!semver.intersects(projectPkgDeps[dep], blockPkgDeps[dep])) {
      conflicts.push([dep, blockPkgDeps[dep], projectPkgDeps[dep]]);
    }
  });
  return {
    conflicts,
    lacks,
  };
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

      this.on('error', e => {
        debug(e); // handle the error for aviod throw generator default error stack
      });
    }

    async writing() {
      let targetPath = join(paths.absPagesPath, this.path);
      debug(`get targetPath ${targetPath}`);
      while (existsSync(targetPath)) {
        this.path = (await this.prompt({
          type: 'input',
          name: 'path',
          message: `path ${
            this.path
          } already exist, please input a new path for it`,
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

      // you can find the copy api detail in https://github.com/SBoudrias/mem-fs-editor/blob/master/lib/actions/copy.js
      debug('start copy block file to your project...');
      ['src', '@'].forEach(folder => {
        const folderPath = join(this.sourcePath, folder);
        const targetFolder = folder === 'src' ? targetPath : paths.absSrcPath;
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
