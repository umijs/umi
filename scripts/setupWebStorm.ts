import { join } from 'path';
import { eachPkg, getPkgs, setExcludeFolder } from './utils';

const cwd = process.cwd();
eachPkg(getPkgs(), ({ pkg }) => {
  setExcludeFolder({ pkg, cwd });
});

eachPkg(
  getPkgs({ base: join(__dirname, '../examples') }),
  ({ pkg }) => {
    setExcludeFolder({
      pkg,
      cwd,
      dirName: 'examples',
      folders: ['.mfsu', '.umi'],
    });
  },
  {
    base: join(__dirname, '../examples'),
  },
);
