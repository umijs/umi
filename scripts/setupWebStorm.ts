import { PATHS } from './.internal/constants';
import { eachPkg, getPkgs, setExcludeFolder } from './.internal/utils';

const cwd = process.cwd();
eachPkg(getPkgs(), ({ name }) => {
  setExcludeFolder({ pkg: name, cwd });
});

eachPkg(
  getPkgs({ base: PATHS.EXAMPLES }),
  ({ name }) => {
    setExcludeFolder({
      pkg: name,
      cwd,
      dirName: 'examples',
      folders: ['.mfsu', '.umi'],
    });
  },
  {
    base: PATHS.EXAMPLES,
  },
);
