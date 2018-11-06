import { existsSync } from 'fs';
import { join } from 'path';
import semver from 'semver';

const debug = require('debug')('umi-build-dev:MaterialGenerator');

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
  const lackDeps = [];
  const conflictDeps = [];
  Object.keys(blockPkgDeps).forEach(dep => {
    if (!projectPkgDeps[dep]) {
      lackDeps.push([dep, blockPkgDeps[dep]]);
    } else if (!semver.intersects(projectPkgDeps[dep], blockPkgDeps[dep])) {
      conflictDeps.push([dep, blockPkgDeps[dep], projectPkgDeps[dep]]);
    }
  });
  return {
    conflictDeps,
    lackDeps,
  };
}

export default api => {
  const { paths, log, Generator } = api;

  return class MaterialGenerator extends Generator {
    constructor(args, opts) {
      super(args, opts);

      this.sourcePath = opts.sourcePath;
      this.dryRun = opts.dryRun;
      this.npmClient = opts.npmClient || 'npm';
      const pkgPath = join(this.sourcePath, 'package.json');
      if (!existsSync(pkgPath)) {
        throw new Error(`not find package.json in ${this.sourcePath}`);
      }
      // eslint-disable-next-line
      this.pkg = require(pkgPath);
      this.name = opts.name || getNameFromPkg(this.pkg);
    }

    async writing() {
      if (!this.name) {
        return log.error("not find name in block's package.json");
      }
      // eslint-disable-next-line
      const projectPkg = require(join(paths.cwd, 'package.json'));
      const { conflictDeps, lackDeps } = dependenciesConflictCheck(
        this.pkg.dependencies,
        projectPkg.dependencies,
      );
      debug(`conflictDeps ${conflictDeps}, lackDeps ${lackDeps}`);
      if (conflictDeps.length) {
        return log.error(`
find dependencies conflict between block and your project:
${conflictDeps
          .map(info => {
            return `* ${info[0]}: ${
              info[2]
            }(your project) not compatible with ${info[1]}(block)`;
          })
          .join('\n')}`);
      }
      let targetPath = join(paths.absPagesPath, this.name);
      let blockName = this.name;
      debug(`get targetPath ${targetPath}`);
      if (existsSync(targetPath)) {
        blockName = await this.prompt({
          type: 'input',
          name: 'name',
          message: `page ${
            this.name
          } already exist, please input a new name for it`,
          required: true,
          default: this.name,
        });
        blockName = blockName.name;
        targetPath = join(paths.absPagesPath, blockName);
        debug(`targetPath exist get new targetPath ${targetPath}`);
      }
      if (this.dryRun) {
        log.log('dryRun is true, skip install dependencies and copy files');
        return;
      }
      if (lackDeps.length) {
        log.info(`install dependencies ${lackDeps} with ${this.npmClient}`);
        // install block dependencies
        this.scheduleInstallTask(
          this.npmClient,
          lackDeps.map(dep => `${dep[0]}@${dep[1]}`),
          {
            save: true,
          },
          {
            cwd: paths.cwd,
          },
        );
      }
      log.log('start copy block file to your project...');
      this.fs.copy(join(this.sourcePath, 'src'), targetPath);
      const commonPath = join(this.sourcePath, '@');
      if (existsSync(commonPath)) {
        this.fs.copy(commonPath, paths.absSrcPath);
      }
    }
  };
};
