import { writeFileSync } from 'fs';
import { info } from '../logger';
import { Context } from '../types';

export class Runner {
  cwd: string;
  context: Context;
  constructor(opts: { cwd: string; context: Context }) {
    this.cwd = opts.cwd;
    this.context = opts.context;
  }

  run() {
    const pkg = this.context.pkg;
    const newPkg = this.transform(pkg);
    writeFileSync(this.context.pkgPath, JSON.stringify(newPkg, null, 2));
  }

  // 在这里修改 pkg 内容
  transform(pkg: {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    engines?: Record<string, string>;
    tnpm?: { mode?: string };
    ci?: { version?: string };
  }) {
    // scripts
    pkg.scripts ||= {};
    if (pkg.scripts['lint'] !== 'umi lint') {
      pkg.scripts['lint'] = 'umi lint';
      info('Update scripts.lint to `umi lint`');
    }
    if (pkg.scripts['lint:fix'] !== 'umi lint --fix') {
      pkg.scripts['lint:fix'] = 'umi lint --fix';
      info('Update scripts.lint:fix to `umi lint --fix`');
    }
    if (pkg.scripts['postinstall']) {
      if (!pkg.scripts['postinstall'].includes('umi setup')) {
        pkg.scripts['postinstall'] = pkg.scripts['postinstall'].replace(
          'umi g tmp',
          'umi setup',
        );
        info('Update scripts.postinstall to use `bigfish setup`');
      }
    } else {
      pkg.scripts['postinstall'] = 'umi setup';
      info('Add scripts.postinstall to `umi setup`');
    }
    pkg.scripts['setup'] = 'umi setup';
    info('Add scripts.set to `umi setup`');
    // dependencies
    if (pkg.dependencies?.['umi']) {
      if (pkg.dependencies?.['umi'] !== '^4.0.0') {
        pkg.dependencies['umi'] = '^4.0.0';
        info('Update dependencies.umi to 4.0.0');
      }
    } else if (pkg.devDependencies?.['umi']) {
      if (pkg.devDependencies?.['umi'] !== '^4.0.0') {
        pkg.devDependencies['umi'] = '^4.0.0';
        info('Update devDependencies.umi to 4.0.0');
      }
    } else {
      throw new Error('umi dependency not found in package.json');
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
