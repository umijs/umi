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

  throw new Error();

  return lock.packages;
}
