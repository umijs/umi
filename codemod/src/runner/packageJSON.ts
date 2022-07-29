import { semver } from '@umijs/utils';
import { info } from '../logger';
import { Context } from '../types';
import { writePrettierFileSync } from '../utils/writePrettierFileSync';

export class Runner {
  cwd: string;
  context: Context;
  constructor(opts: { cwd: string; context: Context }) {
    this.cwd = opts.cwd;
    this.context = opts.context;
  }

  run() {
    const newPkg = this.transform(this.context.pkg, this.context.importSource);
    writePrettierFileSync(
      this.context.pkgPath,
      JSON.stringify(newPkg, null, 2),
    );
  }

  // 在这里修改 pkg 内容
  transform(
    pkg: {
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      engines?: Record<string, string>;
      tnpm?: { mode?: string };
      ci?: { version?: string };
    },
    importSource: string,
  ) {
    const commandName = importSource === '@umijs/max' ? 'max' : importSource;

    // scripts
    pkg.scripts ||= {};
    if (pkg.scripts['lint'] !== `${commandName} lint`) {
      pkg.scripts['lint'] = `${commandName} lint`;
      info(`Update scripts.lint to \`${commandName} lint\``);
    }
    if (pkg.scripts['lint:fix'] !== `${commandName} lint --fix`) {
      pkg.scripts['lint:fix'] = `${commandName} lint --fix`;
      info(`Update scripts.lint:fix to \`${commandName} lint --fix\``);
    }
    if (pkg.scripts['postinstall']) {
      if (!pkg.scripts['postinstall'].includes(`${commandName} setup`)) {
        pkg.scripts['postinstall'] = pkg.scripts['postinstall'].replace(
          `${commandName} g tmp`,
          `${commandName} setup`,
        );
        info(`Update scripts.postinstall to use  \`${commandName} setup\``);
      }
    } else {
      pkg.scripts['postinstall'] = `${commandName} setup`;
      info(`Add scripts.postinstall to \`${commandName} setup\``);
    }
    pkg.scripts['setup'] = `${commandName} setup`;
    info(`Add scripts.setup to \`${commandName} setup\``);
    // dependencies
    if (importSource === 'alita') {
      if (pkg.dependencies?.['alita']) {
        if (!semver.satisfies(pkg.dependencies?.['alita'], '>=3.0.0')) {
          pkg.dependencies['alita'] = '^3.0.12';
          info('Update dependencies.alita to 3.0.12');
        }
      } else if (pkg.devDependencies?.['alita']) {
        if (!semver.satisfies(pkg.devDependencies?.['alita'], '>=3.0.0')) {
          pkg.devDependencies['alita'] = '^3.0.12';
          info('Update devDependencies.alita to 3.0.12');
        }
      }
    } else {
      if (pkg.dependencies?.['umi']) {
        if (!semver.satisfies(pkg.dependencies?.['umi'], '>=4.0.0')) {
          pkg.dependencies[importSource] = '^4.0.0';
          info(`Update dependencies.${importSource} to 4.0.0`);
        }
      } else if (pkg.devDependencies?.['umi']) {
        if (!semver.satisfies(pkg.devDependencies?.['umi'], '>=4.0.0')) {
          pkg.devDependencies[importSource] = '^4.0.0';
          info(`Update devDependencies.${importSource} to 4.0.0`);
        }
      } else {
        throw new Error('umi dependency not found in package.json');
      }
    }

    const { deps, devDeps } = this.context;
    if (Object.keys(deps?.includes || {}).length) {
      pkg.dependencies = {
        ...pkg.dependencies,
        ...deps.includes,
      };
      info(`Add dependencies ${JSON.stringify(deps.includes)}`);
    }
    if (Object.keys(devDeps?.includes || {}).length) {
      pkg.devDependencies = {
        ...pkg.devDependencies,
        ...devDeps.includes,
      };
      info(`Add devDependencies ${JSON.stringify(devDeps.includes)}`);
    }
    if (deps?.excludes.length) {
      deps.excludes.forEach((dep) => {
        delete pkg.dependencies?.[dep];
      });
      info(`Delete dependencies ${deps.excludes.join(',')}`);
    }
    if (devDeps?.excludes.length) {
      devDeps.excludes.forEach((dep) => {
        delete pkg.devDependencies?.[dep];
      });
      info(`Delete devDependencies ${devDeps.excludes.join(',')}`);
    }
    return pkg;
  }
}
