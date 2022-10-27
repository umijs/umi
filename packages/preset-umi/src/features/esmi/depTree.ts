import path from 'path';
import Arborist from '@npmcli/arborist';
import { fsExtra } from '@umijs/utils';
import type { IPkgData } from './Service';

export async function getDepTree(data: IPkgData): Promise<any> {
  const tmpPkg: { dependencies: Record<string, string> } = { dependencies: {} };
  const tmpPkgPath = path.join(process.cwd(), '.tmp', 'package.json');

  data.pkgInfo.exports.forEach(({ deps }) => {
    deps.forEach((dep) => {
      tmpPkg.dependencies[dep.name] = dep.version;
    });
  });

  const deps = data.pkgInfo.exports.reduce<string[]>((prev, curr) => prev.concat(curr.deps.map(d => d.name)), [])

  fsExtra.ensureDirSync(path.dirname(tmpPkgPath));
  fsExtra.writeFileSync(tmpPkgPath, JSON.stringify(tmpPkg, null, 2));

  console.log('start');
  const arborist = new Arborist({
    path: path.dirname(tmpPkgPath),
    update: false,
    log: 'error' as any,
    legacyPeerDeps: false,
    strictPeerDeps: false,
  });
  console.log('ideal');
  const idealTree = await arborist.buildIdealTree({
    saveType: 'dev',
  });
  console.log('meta');
  const meta = idealTree.meta!;
  console.log('commit');
  const lock = meta.commit();

  console.log(lock.packages);

  const { packages } = lock;
  const packageKeys = Object.keys(packages);

  const result: Record<string, any>= {};

  function collectDependencies(name: string) {
    const pkgJson = packages[name];
    const { dependencies = {} } = pkgJson;

    Object.keys(dependencies).forEach((dep) => {
      let findKey = [name, 'node_modules', dep].join('/');
      while (findKey && !packageKeys.includes(findKey)) {
        const arr = findKey.split('node_modules');
        arr.splice(arr.length - 2, 1);
        findKey = arr.join('node_modules');
      }

      result[findKey] = packages[findKey];

      collectDependencies(findKey);
    });
  }

  deps.forEach((name) => {
    const pkgKey = packageKeys.find((n) => n === `node_modules/${name}`);
    if (pkgKey) {
      collectDependencies(pkgKey);
    }
  });

  console.log(result);

  throw new Error();

  return lock.packages;
}
