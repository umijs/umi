import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import semver from 'semver';
import chalk from 'chalk';
import clipboardy from 'clipboardy';
import { CONFIG_FILES, SINGULAR_SENSLTIVE } from '../../../constants';
import writeNewRoute from '../../../utils/writeNewRoute';

const debug = require('debug')('umi-build-dev:MaterialGenerator');

function getConfigFile(cwd) {
  // TODO maybe add a paths.absConfigPath
  const files = CONFIG_FILES.map(file => join(cwd, file)).filter(file =>
    existsSync(file),
  );
  return files[0];
}

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
  `[\'\"]@\/(${SINGULAR_SENSLTIVE.join('|')})\/`,
  'g',
);

export function parseContentToSingular(content) {
  return content.replace(singularReg, (all, match) => {
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
  const { paths, log, Generator, config, applyPlugins } = api;

  return class MaterialGenerator extends Generator {
    constructor(args, opts) {
      super(args, opts);

      this.sourcePath = opts.sourcePath;
      this.dryRun = opts.dryRun;
      this.npmClient = opts.npmClient || 'npm';
      this.name = opts.name;
      this.skipDependencies = opts.skipDependencies;
      this.skipModifyRoutes = opts.skipModifyRoutes;

      this.on('error', e => {
        debug(e); // handle the error for aviod throw generator default error stack
      });

      this.on('end', () => {
        const viewUrl = `http://localhost:${process.env.PORT || '8000'}/${
          this.name
        }`;
        if (config.routes && !this.skipModifyRoutes) {
          log.info('start write new route to your routes config...');
          try {
            writeNewRoute(
              this.name,
              getConfigFile(paths.cwd),
              paths.absSrcPath,
            );
            log.info('write done');
          } catch (e) {
            debug(e);
            log.warn(e.message);
            log.warn('write routes failed, you need modify it by yourself');
          }
        }
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
        throw new Error(`not find package.json in ${this.sourcePath}`);
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
        const projectPkgPath = applyPlugins(
          '_modifyBlockDependenciesPackageJSONPath',
          {
            initialValue: join(paths.cwd, 'package.json'),
          },
        );
        if (!existsSync(projectPkgPath)) {
          throw new Error(`not find package.json in your project ${paths.cwd}`);
        }
        // eslint-disable-next-line
        const projectPkg = require(projectPkgPath);

        // get confilict dependencies and lack dependencies
        const { conflicts, lacks } = applyPlugins(
          '_modifyBlockDependenciesCheckResult',
          {
            initialValue: dependenciesConflictCheck(
              this.pkg.dependencies,
              projectPkg.dependencies,
            ),
          },
        );
        debug(`conflictDeps ${conflicts}, lackDeps ${lacks}`);

        // find confilict dependencies throw error
        if (conflicts.length) {
          throw new Error(`
  find dependencies conflict between block and your project:
  ${conflicts
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
        } else if (lacks.length) {
          log.info(`install dependencies ${lacks} with ${this.npmClient}`);
          // install block dependencies
          this.scheduleInstallTask(
            this.npmClient,
            lacks.map(dep => `${dep[0]}@${dep[1]}`),
            {
              save: true,
            },
            {
              cwd: dirname(projectPkgPath),
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

      // you can find the copy api detail in https://github.com/SBoudrias/mem-fs-editor/blob/master/lib/actions/copy.js
      log.info('start copy block file to your project...');
      this.fs.copy(join(this.sourcePath, 'src'), targetPath, {
        process(content) {
          content = String(content);
          if (config.singular) {
            content = parseContentToSingular(content);
          }
          return applyPlugins('_modifyBlockContent', {
            initialValue: content,
          });
        },
      });
      const commonPath = join(this.sourcePath, '@');
      if (existsSync(commonPath)) {
        if (config.singular) {
          // @/components/ => @/src/component/
          readdirSync(commonPath).forEach(name => {
            const thePath = join(commonPath, name);
            if (statSync(thePath).isDirectory()) {
              name = getSingularName(name);
            }
            this.fs.copy(thePath, join(paths.absSrcPath, name));
          });
        } else {
          this.fs.copy(commonPath, paths.absSrcPath);
        }
      }
    }
  };
};
