import { existsSync } from 'fs';
import { join } from 'path';
import semver from 'semver';
import chalk from 'chalk';
import clipboardy from 'clipboardy';

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
      this.name = opts.name;
      this.skipDependencies = opts.skipDependencies;

      this.on('error', e => {
        debug(e); // handle the error for aviod throw generator default error stack
      });

      this.on('end', () => {
        const viewUrl = `http://localhost:${process.env.PORT || '8000'}/${
          this.name
        }`;
        clipboardy.writeSync(viewUrl);
        log.success(
          `probable url ${chalk.cyan(viewUrl)} ${chalk.dim(
            '(copied to clipboard)',
          )} for view the block.`,
        );
      });
    }

    async writing() {
      // get block package.json data
      const pkgPath = join(this.sourcePath, 'package.json');
      if (!existsSync(pkgPath)) {
        return log.error(`not find package.json in ${this.sourcePath}`);
      } else {
        // eslint-disable-next-line
        this.pkg = require(pkgPath);
      }

      // generate block name
      if (!this.name) {
        const pkgName = getNameFromPkg(this.pkg);
        if (!pkgName) {
          return log.error("not find name in block's package.json");
        }
        this.name = pkgName;
      }

      // check dependencies conflict and install dependencies
      if (this.skipDependencies) {
        log.info('skip dependencies');
      } else {
        // read project package.json
        const projectPkgPath = join(paths.cwd, 'package.json');
        if (!existsSync(projectPkgPath)) {
          throw new Error(`not find package.json in your project ${paths.cwd}`);
        }
        // eslint-disable-next-line
        const projectPkg = require(projectPkgPath);

        // get confilict dependencies and lack dependencies
        const { conflictDeps, lackDeps } = dependenciesConflictCheck(
          this.pkg.dependencies,
          projectPkg.dependencies,
        );
        debug(`conflictDeps ${conflictDeps}, lackDeps ${lackDeps}`);

        // find confilict dependencies throw error
        if (conflictDeps.length) {
          throw new Error(`
  find dependencies conflict between block and your project:
  ${conflictDeps
    .map(info => {
      return `* ${info[0]}: ${info[2]}(your project) not compatible with ${
        info[1]
      }(block)`;
    })
    .join('\n')}`);
        }

        // find lack confilict, auto install
        if (this.dryRun) {
          log.log('dryRun is true, skip install dependencies');
        } else if (lackDeps.length) {
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
      }

      let targetPath = join(paths.absPagesPath, this.name);
      debug(`get targetPath ${targetPath}`);
      if (existsSync(targetPath)) {
        this.name = (await this.prompt({
          type: 'input',
          name: 'name',
          message: `page ${
            this.name
          } already exist, please input a new name for it`,
          required: true,
          default: this.name,
        })).name;
        targetPath = join(paths.absPagesPath, this.name);
        debug(`targetPath exist get new targetPath ${targetPath}`);
      }

      if (this.dryRun) {
        log.log('dryRun is true, skip copy files');
        return;
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
