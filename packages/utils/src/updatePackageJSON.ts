import { writeFileSync } from 'fs';
import { resolve } from 'path';
import deepmerge from '../compiled/deepmerge';
import prettier from '../compiled/prettier';

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
    // 删除一个包之后 json会多了一些空行。sortPackage 可以删除掉并且排序
    // prettier 会容忍一个空行
    prettier.format(JSON.stringify(projectPkg), {
      parser: 'json',
    }),
  );
}
export default updatePackageJSON;
