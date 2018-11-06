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
  materialPkgDeps = {},
  projectPkgDeps = {},
) {
  const lackDeps = [];
  const conflictDeps = [];
  Object.keys(materialPkgDeps).forEach(dep => {
    if (!projectPkgDeps[dep]) {
      lackDeps.push([dep, materialPkgDeps[dep]]);
    } else if (!semver.intersects(projectPkgDeps[dep], materialPkgDeps[dep])) {
      conflictDeps.push([dep, materialPkgDeps[dep], projectPkgDeps[dep]]);
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
      this.npmClient = opts.npmClient || 'npm';
      const pkgPath = join(this.sourcePath, 'package.json');
      if (!existsSync(pkgPath)) {
        throw new Error(`not find package.json in ${this.sourcePath}`);
      }
      // eslint-disable-next-line
      this.pkg = require(pkgPath);
      this.name = opts.name || getNameFromPkg(this.pkg);
    }

    writing() {
      if (!this.name) {
        return log.error("not find name in material's package.json");
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
find dependencies conflict between material and your project:
${conflictDeps.map(info => {
          return `dependency ${info[0]}: version${
            info[2]
          } in your project\n not compatible with  ${info[1]} in material`;
        })}
        `);
      }
      const targetPath = join(paths.absPagesPath, this.name);
      this.fs.copy(join(this.sourcePath, 'src'), targetPath);
      if (lackDeps.length) {
        log.info(`install dependencies ${lackDeps} with ${this.npmClient}`);
        // install material dependencies
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

      // TODO
      // const path = this.args[0].toString();
      // const name = basename(path);
      // this.fs.copyTpl(join(paths.absPagesPath, `${path}.js`), {
      //   name,
      // });
    }
  };
};
