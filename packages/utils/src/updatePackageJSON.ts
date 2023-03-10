import { writeFileSync } from 'fs';
import { resolve } from 'path';
import deepmerge from '../compiled/deepmerge';

function updatePackageJSON({
  opts,
  cwd = process.cwd(),
}: {
  opts: object;
  cwd?: string;
}) {
  const packageJsonPath = resolve(cwd, 'package.json');
  const pkg = require(packageJsonPath);
  const projectPkg = deepmerge(pkg, opts) as object;
  writeFileSync(
    packageJsonPath,
    `${JSON.stringify(projectPkg, null, 2)}\n`,
    'utf-8',
  );
}
export default updatePackageJSON;
