import { eachPkg, getPkgs, setExcludeFolder } from './utils';

const pkgs = getPkgs();
const cwd = process.cwd();
eachPkg(pkgs, ({ pkg }) => {
  setExcludeFolder({ pkg, cwd });
});
