import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import semver from 'semver';
import getUserConfig from 'umi-core/lib/getUserConfig';
import registerBabel from 'umi-core/lib/registerBabel';

function getDep(pkg, name) {
  if (pkg.dependencies && pkg.dependencies[name]) return pkg.dependencies[name];
  if (pkg.devDependencies && pkg.devDependencies[name]) return pkg.devDependencies[name];
  return false;
}

function hasFiles(cwd, files) {
  for (const f of files) {
    if (!existsSync(join(cwd, f))) return false;
  }
  return true;
}

export default function(cwd) {
  registerBabel(cwd);
  const config = getUserConfig({ cwd });

  if (config.ssr) return false;

  if (process.env.BIGFISH_COMPAT) {
    if (config.appType !== 'console') return false;
    if (config.deployMode === 'chair') return false;
  }

  const pkgFile = join(cwd, 'package.json');
  const pkg = existsSync(pkgFile) ? JSON.parse(readFileSync(pkgFile, 'utf-8')) : {};

  // disable if react is lower than 16
  const reactVersion = getDep(pkg, 'react');
  if (reactVersion) {
    const reactPkgFile = join(cwd, 'node_modules', 'react', 'package.json');
    const reactPkg = existsSync(reactPkgFile)
      ? JSON.parse(readFileSync(reactPkgFile, 'utf-8'))
      : {};
    if (reactPkg.version && semver.lt(reactPkg.version, '16.0.0')) {
      return false;
    }
  }

  // antdpro@4
  if (getDep(pkg, '@ant-design/pro-layout')) return true;

  // antdpro@3
  if (getDep(pkg, 'ant-design-pro')) return true;

  // antdpro@2
  if (
    getDep(pkg, 'antd-pro-merge-less') ||
    hasFiles(cwd, ['config/router.config.js', 'src/layouts/BasicLayout.js'])
  ) {
    return true;
  }

  // project with tech-ui in alipay
  if (process.env.BIGFISH_COMPAT) {
    if (getDep(pkg, '@alipay/tech-ui') && config.appType === 'console') return true;
  }
}
