import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

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
  const pkgFile = join(cwd, 'package.json');
  const pkg = existsSync(pkgFile) ? JSON.parse(readFileSync(pkgFile, 'utf-8')) : {};

  // antdpro@4
  if (hasDep(pkg, '@ant-design/pro-layout')) return true;

  // antdpro@2
  if (
    hasDep(pkg, 'antd-pro-merge-less') ||
    hasFiles(cwd, ['config/router.config.js', 'src/layouts/BasicLayout.js'])
  ) {
    return true;
  }

  // project with tech-ui in alipay
  if (hasDep(pkg, '@alipay/tech-ui')) return true;
}
