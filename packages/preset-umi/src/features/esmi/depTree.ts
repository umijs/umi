import Arborist from '@npmcli/arborist';
import type { IPkgData } from './Service';

export async function getDepTree(data: IPkgData): Promise<any> {
  const deps = data.pkgInfo.exports.reduce<string[]>(
    (prev, curr) => prev.concat(curr.deps.map((d) => d.name)),
    [],
  );
  const arborist = new Arborist({
    path: process.cwd(),
    lockfileVersion: 3,
    update: false,
    log: 'error' as any,
    legacyPeerDeps: false,
    strictPeerDeps: false,
  });
  const idealTree = await arborist.loadActual({});
  const meta = idealTree.meta!;
  const lock = meta.commit();
  const { packages } = lock;
  const packageKeys = Object.keys(packages);

  const result: Record<string, any> = {};

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

  return {
    packageLockJson: {
      packages: result,
      dependencies: {},
    },
  };
}
