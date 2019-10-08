import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import getUserConfig from 'umi-core/lib/getUserConfig';
import registerBabel from 'umi-core/lib/registerBabel';

function hasDep(pkg, name) {
  if (pkg.dependencies && pkg.dependencies[name]) return true;
  if (pkg.devDependencies && pkg.devDependencies[name]) return true;
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

  if (process.env.BIGFISH_COMPAT) {
    if (config.appType !== 'console') return false;
    if (config.deployMode === 'chair') return false;
  }

  const pkgFile = join(cwd, 'package.json');
  const pkg = existsSync(pkgFile) ? JSON.parse(readFileSync(pkgFile, 'utf-8')) : {};

  // antdpro@4
  if (hasDep(pkg, '@ant-design/pro-layout')) return true;

  // antdpro@3
  if (hasDep(pkg, 'ant-design-pro')) return true;

  // antdpro@2
  if (
    hasDep(pkg, 'antd-pro-merge-less') ||
    hasFiles(cwd, ['config/router.config.js', 'src/layouts/BasicLayout.js'])
  ) {
    return true;
  }

  // project with tech-ui in alipay
  if (process.env.BIGFISH_COMPAT) {
    if (hasDep(pkg, '@alipay/tech-ui') && config.appType === 'console') return true;
  }
}
